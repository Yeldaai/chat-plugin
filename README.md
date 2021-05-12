# Yelda Website Chat Plugin

## Introduction

Yelda Website Chat Plugin is a library that enables your website to load [yelda.ai](https://yelda.ai) webchat in an iframe integrated into your website

![Demo](https://github.com/Yeldaai/chat-plugin/blob/master/screencast-yelda.gif?raw=true "Demo")

## Usage - From Yelda website

Each time a new package version is published, we also update static minified version on Yelda.
```html
<script
  type="text/javascript"
  src="https://yelda-webchat.s3.eu-west-3.amazonaws.com/js/yeldaWebchatInjector.min.js"
></script>

<script>
  yeldaChat.init({settingId: xxxx}) // settingId available on your Yelda Platform > Webchat page
</script>
```

## Usage - From  Node Packages Manager

**System requirements**
Node.JS 8+

**Install & setup**

- Install with npm

```shell
 npm install yelda-webchat --save
```

- Import yeldaChat js lib and yeldaWebchatInjector.min.css OR load js using script and link tags

Or use import instruction

```javascript
import yeldaChat from "yelda-webchat";
import "yelda-webchat/dist/css/yeldaWebchatInjector.min.css";
```

Or add the `<script>` in the `<body>`, and the `<link>` in the `<head>` tags

```html
<link
  rel="stylesheet"
  type="text/css"
  href="/node_modules/yelda/dist/css/yeldaWebchatInjector.min.css"
/>
<script
  type="text/javascript"
  src="/node_modules/yelda/dist/js/yeldaWebchatInjector.min.js"
></script>

<script>
  yeldaChat.init({settingId: xxxx}) // settingId available on your Yelda Platform > Webchat page
</script>
```

if you don't provide the css, the latest yelda version will be automatically loaded asynchroneously by the library

## Usage - downloaded

We don't advise you to download a local version without using the NPM package : you might miss an important update.

--------------

## Expert custom initialization without settingId

Initialize the lib with the Yelda provided elements

| Name              | Type    | Default                | Description                                                                                                                                                        |
| ----------------- | ------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| assistantSlug     | String  |                        | The assistant short name on Yelda **Required**                                                                                                                     |
| assistantId       | String  |                        | The assistant id on Yelda **Required**                                                                                                                             |
| assistantUrl      | String  | `https://app.yelda.ai` |
| chatPath          | String  | `/chat`                |
| locale            | String  | `fr_FR`                |
| isAdmin           | Boolean | `false`                | Set to `true` only to access the conversations analysis                                                                                                            |
| shouldBeOpened    | Boolean | `false`                | Set to `true` to open the chat popin on load. With default `false` value, the webchat is closed and the user only see the assistant image or the start button      |
| parentContainerId | String  |                        | DOM element id where you want to add the iframe. If the 'container_id' does not exist in the DOM, the iframe will be automatically inserted into the document body |
| bubbleContainerChildId | String  |                  | Child DOM element id where you want to add bubble element. If the 'bubbleContainerChildId' does not exist, **the chat won't be loaded** |
| isStartBtn        | Boolean | `false`                | Set to `true` only if need to show 'start' button. ⚠️ This is an admin feature. It can only work if isAdmin is also set to `true`                                  |
| canBeClosed       | Boolean | `true`                 | It is used to toggle the visible state of close button. ⚠️ If parentContainerId is provided and canBeClosed is not provided, canBeClosed is set to `false`         |
| isDemo            | Boolean | `false`                | Set to `true` to flag the conversation as "demo" in conversations list and training inbox and force the webchat to be opened on page load, even if shouldBeOpened is set to false |
| yparam            | String  | `null`                 | If the iframe's parent URL contains "yparam" parameter, then yparam value will be passed as the settings. yparam value "yshowbot" will force the webchat to be opened on page load, even if shouldBeOpened is set to false|

```javascript
yeldaChat.init({
  assistantSlug: "<assistantSlug>",
  assistantId: "<assistantId>",
  assistantUrl: "<assistantUrl>",
  chatPath: "<chatPath>",
  locale: "<locale>",
  isAdmin: true | false, // Used to see the NLP logs
  isStartBtn: true | false, // Used to show the start button on chat load
  shouldBeOpened: true | false, // open the chat window by default on loading the page if set to true
  parentContainerId: "chat_frame",
  canBeClosed: true | false,
  isDemo: true | false, // Only useful if the webchat is on a demo page
});
```

To avoid issue with window.onload which might not be called when using JS Frameworks, you can also use `yeldaChat.setupChat(data)`, and even reset it with `yeldaChat.reset(data)`

## Issues and Feature Requests

If you have a bug report, feature request, or wish to contribute code, please [open an issue](https://github.com/Yeldaai/chat-plugin/issues).

When submitting a bug report, please include the following information :

- Which install setup your are using : npm install or script tags
- Which OS and browser version your are using, e.g. Ubuntu 18.04 with Firefox Quantum 63.0.3
- A minimum reproducible test case, i.e. a short snippet that demonstrates the bug, if applicable

## Run it in local

Build it

```bash
npm run build
```

and then open test/index.html in a browser

## Version update & upload to S3 command

Run this command to build, test, increment the npm version, publish the package, upload to s3 bucket & finally copy the content of dest folder to Yelda repo if the yelda static folder path passed as argument. Default value for semver is patch

It requires AWS creds, bucket & region information in .env to upload the build files to s3 bucket and npm version command requires git working directory to be clean otherwise it throws error

```shell
npm run uploadBuildToS3 --semver=patch --destinationPath=/home/Documents/www/yelda/git/yelda/frontend/static
```

## License

The MIT License (MIT)

Copyright (c) 2018-2019 Yelda <dobby@yelda.ai>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
