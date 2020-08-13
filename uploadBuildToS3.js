'use strict'
/**
 * This script used to upload js, css from dist folder to S3
 *
 * node uploadBuildToS3.js
 *
 * To copy dist folder to Yelda repo include the yelda repo static folder path in the command
 * Like this
 * npm run uploadBuildToS3 '/home/Documents/www/yelda/git/yelda/frontend/static'
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

const main = async () => {
  try {
    const branchName = await getCurrentBranch()

    const output = await updateNPMVersion()
    console.log(output)
    const stdout = await publishPackage()
    console.log(stdout)
    // await pushToGit(branchName)
    await uploadToS3()
    await copyDistToYelda()

    process.exit()
  } catch (err) {
    console.error('Error while uploading to s3:', err)
    process.exit()
  }
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
  return await executeCommand('npm -no-git-tag-version version patch')
}

/**
 * Publishes the package
 */
const publishPackage = async () => {
  console.info('Publishing the package ...')
  return await executeCommand('npm publish')
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
      const filePath = path.join(folderPath, subFile)

      const fileContent = fs.readFileSync(filePath)

      // upload file to S3
      const s3Response = await s3
        .putObject({
          Bucket: process.env.AWS_BUCKET || 'yelda-webchat',
          Key: `${file}/${subFile}`,
          Body: fileContent,
          // ContentType is required to serve the file to browser properly, otherwise s3 sets octet-stream
          ContentType: mime.getType(filePath),
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
 * Copy html to dist folder
 */
const copyDistToYelda = async () => {
  if (!process.argv || !process.argv.length || !process.argv[2]) {
    console.info('destination is not provided in the option')
    return
  }

  console.info('Copying dist folder content to the destination folder')

  const destFolderPath = process.argv[2]

  if (!fs.existsSync(destFolderPath)) {
    throw new Error('Provided folder in the argument does not exists')
  }

  const distFolder = path.join(__dirname, '/dist')
  await executeCommand(`cp -a ${distFolder}/. ${destFolderPath}`)
  console.info('dist copied to the destination folder')

  return
}

main()
