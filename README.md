Yelda Website Chat Plugin
=====

# Introduction
Yelda Website Chat Plugin is a library that enables your website to load [yelda.ai](https://yelda.ai) webchat in an iframe integrated into your website

![Demo](screencast-yelda.gif "Demo")

# Using Package Managers

## System requirement
Node.JS 8+

## Install
Install with npm
```shell
 npm install yelda-webchat --save
```

## Usage
Import yeldaChat lib and injector.min.css and initialize the lib with the Yelda provided elements
- assistantSlug
- assistantId
- assistantUrl : `https://app.yelda.ai`
- chatPath : `/chat`
- locale : `fr_FR`

```javascript
  import yeldaChat from 'yelda-webchat'
  import 'yelda-webchat/dist/css/injector.min.css'

  yeldaChat.init({
    'assistantSlug': '<assistantSlug>',
    'assistantId': '<assistantId>',
    'assistantUrl': '<assistantUrl>',
    'chatPath': '<chatPath>',
    'locale': '<locale>',
    'isAdmin': true | false // Used to see the NLP logs
  })
```

# Using script tags

## Usage

Add the style using the link tag in the webpage <head> tag

```html
  <link rel="stylesheet" type="text/css" href="/node_modules/yelda/dist/css/injector.min.css"/>
```

Add the script tag before closing the <body> tag of the same webpage
```html
  <script type="text/javascript" src="/node_modules/yelda/dist/js/yelda.min.js"></script>
```

Initialize the lib with the Yelda provided elements :
- assistantSlug
- assistantId
- assistantUrl : `https://app.yelda.ai`
- chatPath : `/chat`
- locale : `fr_FR`

```javascript
  yeldaChat.init({
    'assistantSlug': '<assistantSlug>',
    'assistantId': '<assistantId>',
    'assistantUrl': '<assistantUrl>',
    'chatPath': '<chatPath>',
    'locale': '<locale>',
    'isAdmin': true | false // Used to see the NLP logs
  })
```

# Issues and Feature Requests
If you have a bug report, feature request, or wish to contribute code, please [open an issue](https://github.com/Yeldaai/chat-plugin/issues).

When submitting a bug report, please include the following information :
- Which install setup your are using : npm install or script tags
- Which OS and browser version your are using, e.g. Ubuntu 18.04 with Firefox Quantum 63.0.3
- A minimum reproducible test case, i.e. a short snippet that demonstrates the bug, if applicable

License
=======

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
