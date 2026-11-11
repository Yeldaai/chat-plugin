'use strict'
/**
 * This script used to upload js, css from dist folder to S3
 *
 * node uploadBuildToS3.js
 *
 * To copy dist folder to Yelda repo include the yelda repo static folder path in the command
 * Like this
 * npm run uploadBuildToS3 --destinationPath=/home/Documents/www/yelda/git/yelda/frontend/static --semver=patch --otp=<code>
 *
 * npm (>= 7) passes these options as lowercased env vars (npm_config_destinationpath, npm_config_semver, npm_config_otp),
 * which are used as defaults. Running the script directly also works: node uploadBuildToS3 build -s patch -d <path> -o <code>
 * This command uploadBuildToS3 runs build, test, upload to s3, npm version update, push to git and move dist folder to yelda repo
 */

require('dotenv').config({
  path: process.env.DOTENV || '.env'
})

const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')
const mime = require('mime')
const { exec } = require('child_process')
const yargs = require('yargs')

// Parse the command line arguments
const argv = yargs
    .command('build', 'Increments the version number based on semver & copies dest folder to Yelda repo', {
      semver: {
        description: 'Semantic versioning for the npm',
        alias: 's',
        choices: ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease'],
        default: process.env.npm_config_semver
      },
      destinationPath: {
        description: 'Destination path to copy',
        alias: 'd',
        type: 'string',
        default: process.env.npm_config_destinationpath
      },
      otp: {
        description: 'Npm one-time password from your authenticator',
        alias: 'o',
        type: 'string',
        default: process.env.npm_config_otp
      }
    })
    .argv

const main = async () => {
  try {
    checkNoUnexpectedArguments()

    // Check if there are any change that has not been committed before starting the script
    if (!(await checkIfAllChangesCommitted())) {
      throw new Error('Some changes are not committed. Commit your changes or stash them before running this script.')
    }

    // Validate the destination before uploading, so a wrong path can't leave S3 updated without a release
    const destFolderPath = getDestinationFolderPath()

    await uploadToS3()

    await copyDistToYelda(destFolderPath)

    const branchName = await getCurrentBranch()

    const version = await updateNPMVersion()
    console.info(version)

    await pushToGit(branchName)

    // Publish the package last to ensure that if an error occurs before, the package won't be published
    const publishResponse = await publishPackage()
    console.info(publishResponse)

    process.exit()
  } catch (err) {
    console.error('Error while uploading to s3:', err)
    process.exit(1)
  }
}

/**
 * Stops the release before anything is uploaded or pushed when stray positional arguments are given,
 * e.g. the old `npm run uploadBuildToS3 -o <code>` form, where npm appends the code as a positional argument
 * and the OTP would otherwise be silently ignored until `npm publish` fails at the very end
 * @throws {Error}
 */
const checkNoUnexpectedArguments = () => {
  const unexpectedArgs = argv._.filter((arg) => arg !== 'build')

  if (unexpectedArgs.length) {
    throw new Error(`Unexpected arguments: ${unexpectedArgs.join(' ')}. Use --otp=<code>, --semver=<semver> and --destinationPath=<path>.`)
  }
}


/**
 * Check if they are any change that has not been committed to avoid uploading to S3 unwanted changes
 * @returns {Promise<Boolean>}
 */
const checkIfAllChangesCommitted = async () => {
  const output = await executeCommand('git status --porcelain')
  return !output || !output.length
}

/**
 * Executes the given command
 * @param {String} cmd
 * @return {Promise<string>} - stdout
 */
const executeCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error) {
        reject(error)
      }

      resolve(typeof stdout === 'string' ? stdout.trim() : false)
    })
  })
}

/**
 * Get the current git branch name
 * @return {Promise<string>} stdout
 */
const getCurrentBranch = async() => {
  return await executeCommand('git rev-parse --abbrev-ref HEAD')
}

/**
 * Updates the NPM version & git commit added with the updated version
 *  @return {Promise<string>} stdout
 */
const updateNPMVersion = async () => {
  console.info('Updating npm version ...')
  // Get the Semantic Versioning from argument if found or else use the default 'patch'
  const semver = (argv._.includes('build') && argv.semver) || 'patch'
  return await executeCommand(`npm -no-git-tag-version version ${semver}`)
}

/**
 * Publishes the package
 */
const publishPackage = async () => {
  console.info('Publishing the package ...')
  const otp = (argv._.includes('build') && argv.otp) ? `--otp=${argv.otp}` : ''

  return await executeCommand(`npm publish ${otp}`)
}

/**
 * Pushes the version update to git's current branch
 * @param {String} branchName
 * @return {Promise<string>} stdout
 */
const pushToGit = async (branchName) => {
  await executeCommand(`git commit -am "npm version update"`)
  return await executeCommand(`git push origin ${branchName}`)
}

/**
 * Upload build files to S3
 */
const uploadToS3 = async () => {
  console.info('Start uploading to S3')

  if (
    !process.env.AWS_REGION ||
    !process.env.AWS_BUCKET ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    throw new Error('No credentials for AWS/S3')
  }

  const s3 = new AWS.S3({
    region: process.env.AWS_REGION || 'eu-west-3',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sslEnabled: true,
    apiVersion: '2006-03-01'
  })

  const distFolder = path.join(__dirname, '/dist')

  const files = fs.readdirSync(distFolder)

  if (!files || !files.length) {
    throw new Error('dist folder not found or it is empty')
  }

  for (const file of files) {
    // Read the files from js/css folder
    const folderPath = path.join(distFolder, file)
    const subFiles = fs.readdirSync(folderPath)

    for (const subFile of subFiles) {
      const ext = path.extname(subFile)
      // Only upload renamed gzip and map files to s3
      if (!['.gz', '.map'].includes(ext)) {
        continue
      }

      const unzippedFile = subFile.replace('.gz', '')
      const filePath = path.join(folderPath, subFile)
      const unzippedFilePath = path.join(folderPath, unzippedFile)

      const fileContent = fs.readFileSync(filePath)

      // upload file to S3
      const s3Response = await s3
        .putObject({
          Bucket: process.env.AWS_BUCKET || 'yelda-webchat',
          Key: `${file}/${unzippedFile}`,
          Body: fileContent,
          // ContentType is required to serve the file to browser properly, otherwise s3 sets octet-stream
          ContentType: mime.getType(unzippedFilePath),
          ...(ext === '.gz' && {
            ContentEncoding: 'gzip'
          }),
          ACL: 'public-read' //Public read permission
        })
        .promise()

      if (s3Response) {
        console.info(`Successfully uploaded '${file}/${subFile}'`)
      } else {
        throw new Error(`Failed to upload file '${file}/${subFile}'`)
      }
    }
  }
}

/**
 * Get the folder the dist folder should be copied to, and check that it is an existing directory
 * @throws {Error} if destinationPath is provided but is not an existing directory
 * @return {String|false} destination folder path, or false when destinationPath is not provided
 */
const getDestinationFolderPath = () => {
  const destFolderPath = (argv._.includes('build') && argv.destinationPath) || false

  if (!destFolderPath) {
    return false
  }

  if (!fs.existsSync(destFolderPath) || !fs.statSync(destFolderPath).isDirectory()) {
    throw new Error(`Provided destinationPath is not an existing folder: ${destFolderPath}`)
  }

  return destFolderPath
}

/**
 * Copy the dist folder content to the destination folder
 * @param {String|false} destFolderPath - validated by getDestinationFolderPath
 */
const copyDistToYelda = async (destFolderPath) => {
  if (!destFolderPath) {
    console.info('destinationPath is not provided in the option')
    return
  }

  console.info('Copying dist folder content to the destination folder')

  const distFolder = path.join(__dirname, '/dist')
  await executeCommand(`cp -a ${distFolder}/. ${destFolderPath}`)
  console.info('dist copied to the destination folder')

  return
}

main()
