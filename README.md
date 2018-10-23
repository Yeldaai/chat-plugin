# Web Chat Plugin for Yelda
Website Chat Plugin for [yelda.ai](https://yelda.ai)

# Using Package Managers

Add the yelda package using this command
```
 # NPM
 npm install yelda-webchat --save
```

Use it in your code
```
  import yeldaChat from 'yelda-webchat'
  import 'yelda-webchat/dist/css/injector.min.css'

  yeldaChat.init({
    'assistantSlug': '<assistantSlug>',
    'assistantId': '<assistantId>',
    'assistantUrl': '<assistantUrl>',
    'chatPath': '<chatPath>',
    'locale': '<locale>',
    'isAdmin': true | false //used to see the NLP logs
  })
```

Compile the your javascript code

# Using script tags

Add the style using the link tag in your <head> tag

```
  <link rel="stylesheet" type="text/css" href="/node_modules/yelda/dist/css/injector.min.css"/>
```

Add the script tag before closing the <body> tag
```
  <script type="text/javascript" src="/node_modules/yelda/dist/js/yelda.min.js"></script>
```
