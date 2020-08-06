# Yelda Website Chat Plugin

# Introduction

Yelda Website Chat Plugin is a library that enables your website to load [yelda.ai](https://yelda.ai) webchat in an iframe integrated into your website

![Demo](https://github.com/Yeldaai/chat-plugin/blob/master/screencast-yelda.gif?raw=true "Demo")

# Load the scripts

You can load the scripts from yelda-webchat NPM package or from yelda website

## With Node Packages Manager

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
```

## From Yelda website

Each time a new package version is published, we also update static minified version on Yelda.
You can directly load these files with classic script and link tags as explained above

```html
<link
  type="text/css"
  rel="stylesheet"
  href="https://app.yelda.ai/static/css/yeldaWebchatInjector.min.css"
/>
<script
  type="text/javascript"
  src="https://app.yelda.ai/static/js/yeldaWebchatInjector.min.js"
></script>
```

Using NPM give you the ownership on the Yelda plugin updates. For example you might want to test it in a preprod version to ensure that a CSS change would not affect your stylesheet (each new version is carefully tested, but you might want to check it yourself 😉)
Loading direct link from Yelda ensure to always use the latest version in production without redeploying your website assets (but it might require users to clear their cache)

We don't advise you to download a local version without using the NPM package : you might miss an important update.

# Init the library

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
| isStartBtn        | Boolean | `false`                | Set to `true` only if need to show 'start' button. ⚠️ This is an admin feature. It can only work if isAdmin is also set to `true`                                  |
| canBeClosed       | Boolean | `true`                 | It is used to toggle the visible state of close button. ⚠️ If parentContainerId is provided and canBeClosed is not provided, canBeClosed is set to `false`         |
| isDemo            | Boolean | `false`                | Set to `true` to flag the conversation as "demo" in conversations list and training inbox and force the webchat to be opened on page load, even if shouldBeOpened is set to false |

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

To avoid issue with window.onload which might not be called when using JS Frameworks, you can also use `yeldaChat.setupChat(data)`, and even reset it with `yeldaChat.reset(data)

# Issues and Feature Requests

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

# License

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
