(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("YeldaChat", [], factory);
	else if(typeof exports === 'object')
		exports["YeldaChat"] = factory();
	else
		root["YeldaChat"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "1AmZ");
/******/ })
/************************************************************************/
/******/ ({

/***/ "1AmZ":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("iCc5");
/* harmony import */ var babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("V7oC");
/* harmony import */ var babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _css_yeldaWebchatInjector_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("c39r");
/* harmony import */ var _css_yeldaWebchatInjector_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_css_yeldaWebchatInjector_css__WEBPACK_IMPORTED_MODULE_2__);




var YeldaChat = function () {
  function YeldaChat() {
    babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default()(this, YeldaChat);
  }

  babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default()(YeldaChat, [{
    key: 'updateQueryStringParameter',

    /**
     * Updates the url with the given parameter and value
     * @param {String} uri
     * @param {String} key
     * @param {String} value
     */
    value: function updateQueryStringParameter(uri, key, value) {
      var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
      var separator = uri.indexOf('?') !== -1 ? '&' : '?';

      if (uri.match(re)) {
        return uri.replace(re, '$1' + key + '=' + value + '$2');
      } else {
        return uri + separator + key + '=' + value;
      }
    }

    /**
     * Create webChatContainer, which is the main div containing image and webchat elements
     * and add it to the DOM
    */

  }, {
    key: 'createContainer',
    value: function createContainer() {
      // Parent div to append the iframe
      if (!this.webChatContainer) {
        this.webChatContainer = document.createElement('div');
        this.webChatContainer.setAttribute('id', 'yelda_container');
        this.webChatContainer.setAttribute('class', 'yelda_container');
        document.body.appendChild(this.webChatContainer);
      }
    }

    /**
    * Create assistantImage element and add it to webChatContainer element
    */

  }, {
    key: 'addAssistantImage',
    value: function addAssistantImage() {
      if (!this.webChatContainer) {
        this.webChatContainer = document.getElementById('yelda_container');
      }

      // Removed the Assistant Img element if already rendered in the DOM
      if (document.getElementById('assistant_img')) {
        document.getElementById('assistant_img').remove();
      }

      // Assistant Image Creation
      this.assistantImage = document.createElement('div');
      this.assistantImage.setAttribute('id', 'assistant_img');
      this.assistantImage.setAttribute('class', 'assistant_img');
      this.assistantImage.innerHTML = '<i class="fas fa-comment"></i>';
      this.webChatContainer.appendChild(this.assistantImage);
    }

    /**
     * Build webchat URL with necessary parameters
     * @param {String} url webchat url
     * @param {String} assistantId assistant id
     * @param {String} assistantSlug assistant slug
     * @return {String} url
    */

  }, {
    key: 'createWebChatURL',
    value: function createWebChatURL(data) {
      var url = data.chatUrl;
      url = this.updateQueryStringParameter(url, 'assistantId', data.assistantId);
      url = this.updateQueryStringParameter(url, 'assistantSlug', data.assistantSlug);
      url = this.updateQueryStringParameter(url, 'locale', data.locale);
      url = this.updateQueryStringParameter(url, 'shouldBeOpened', data.shouldBeOpened);

      if (data.isAdmin) {
        url = this.updateQueryStringParameter(url, 'isAdmin', data.isAdmin);
      }

      return url;
    }

    /**
     * Create iframeContainer and it's child webchat iframe, and it to webChatContainer
     * @param {String} url webchat url
     * @return {Element} iframe HTML element
    */

  }, {
    key: 'createWebChatFrame',
    value: function createWebChatFrame(url) {
      if (!this.webChatContainer) {
        this.webChatContainer = document.getElementById('yelda_container');
      }

      // Iframe creation
      // Parent div to contain the iframe. To allow css animation on iframe
      if (!this.iframeContainer) {
        this.iframeContainer = document.createElement('div');
        this.iframeContainer.setAttribute('id', 'yelda_iframe_container');
        this.iframeContainer.setAttribute('class', 'yelda_iframe_container');
        this.iframeContainer.style.cssText = 'display: none;';
        this.webChatContainer.appendChild(this.iframeContainer);
      }

      var iframe = void 0;

      if (!this.webChatIframe) {
        iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.id = 'web_chat_frame';
        iframe.name = 'frame';
        iframe.style.border = '0';
        this.iframeContainer.appendChild(iframe);
      } else {
        iframe = document.getElementById('web_chat_frame');
      }

      return iframe;
    }
    /**
     * Triggers event on the target
    */

  }, {
    key: 'triggerEvent',
    value: function triggerEvent(target, event) {
      if (typeof Event === 'function') {
        // modern browsers
        target.dispatchEvent(new Event(event));
      } else {
        // This will be executed on old browsers and especially IE
        var customEvent = window.document.createEvent('UIEvents');
        customEvent.initUIEvent(event, true, false, window, 0);
        target.dispatchEvent(customEvent);
      }
    }

    /**
     * handles communcation between parent window and iframe
    */

  }, {
    key: 'handleFrameListner',
    value: function handleFrameListner() {
      var _this = this;

      var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
      var eventer = window[eventMethod];
      var messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';
      eventer(messageEvent, function (e) {
        if (e.data === 'closeChat' || e.message === 'closeChat') {
          document.getElementById('web_chat_frame').classList.remove('y_active');
          setTimeout(function () {
            document.getElementById('assistant_img').style.display = 'block';
            document.getElementById('yelda_iframe_container').style.display = 'none';
          }, 1000);
        } else if (e.data === 'openChat' || e.message === 'openChat') {
          _this.triggerEvent(document.getElementById('assistant_img'), 'click');
        }
      });
    }
    /**
     * handles window resize event by adding and removing class based on window width
    */

  }, {
    key: 'handleOnResize',
    value: function handleOnResize() {
      if (window.outerWidth < 768) {
        var w = window;
        var d = document;
        var e = d.documentElement;
        var g = d.getElementsByTagName('body')[0];
        var x = w.innerWidth || e.clientWidth || g.clientWidth;
        var y = w.innerHeight || e.clientHeight || g.clientHeight;

        this.webChatContainer.classList.add('yelda_mobile');
        this.webChatIframe.style.width = x + 'px';
        this.webChatIframe.style.height = y + 'px';
      } else {
        this.webChatContainer.classList.remove('yelda_mobile');
      }
    }

    /**
     * Load CSS asynchroneously
     * @param {String} origin to retrive css
    */

  }, {
    key: 'loadCssAsync',
    value: function loadCssAsync(origin) {
      var head = document.getElementsByTagName('head')[0];
      var yeldaCss = document.createElement('link');
      yeldaCss.rel = 'stylesheet';
      yeldaCss.type = 'text/css';
      yeldaCss.crossorigin = 'anonymous';
      yeldaCss.href = origin + '/static/css/injector.min.css';
      yeldaCss.media = 'all';
      head.appendChild(yeldaCss);
    }
    /**
     * Gererate webchatURL and create webchatIframe
     * @param {Object} data { data.chatUrl, data.assistantId, data.assistantSlug }
    */

  }, {
    key: 'setUpChatIFrame',
    value: function setUpChatIFrame(data) {
      var webchatUrl = this.createWebChatURL(data);
      this.webChatIframe = this.createWebChatFrame(webchatUrl);
    }
    /**
     * Delete old webchat element and create new webchat
     * @param {Object} data { data.assistantUrl, data.chatPath }
     * @param {Element} container webchat container
    */

  }, {
    key: 'resetChat',
    value: function resetChat(data) {
      if (this.iframeContainer) {
        this.iframeContainer.remove(); // Remove the element from the DOM tree its belongs
      }

      this.iframeContainer = null;
      this.webChatIframe = null;
      data = this.formatData(data);
      this.setUpChatIFrame(data);
      document.getElementById('assistant_img').style.display = 'block';
    }

    /**
     * Set default value for data object used for multiple init functions
     * @param {Object} data { data.assistantUrl, data.chatPath }
     * @param {Object} data
    */

  }, {
    key: 'formatData',
    value: function formatData(data) {
      data.assistantUrl = data.assistantUrl || 'https://app.yelda.ai/';
      data.chatPath = data.chatPath || '';
      data.chatUrl = data.assistantUrl + data.chatPath;
      data.locale = data.locale || 'fr_FR';
      data.isAdmin = data.isAdmin ? true : false;
      data.shouldBeOpened = data.shouldBeOpened ? true : false;

      return data;
    }
  }, {
    key: 'isStyleSheetLoaded',
    value: function isStyleSheetLoaded() {
      var sheets = document.styleSheets;
      var isFound = false;
      var cssSelector = '.assistant_img i'; // Used to check style sheet loaded or not

      if (typeof sheets != 'undefined' && sheets.length) {
        sheetsLoop: for (var i = 0; i < sheets.length; i++) {
          var sheet = document.styleSheets[i];

          try {
            var rules = sheet.cssRules;
            if (typeof rules != 'undefined') {
              for (var j = 0; j < rules.length; j++) {
                if (typeof rules[j].selectorText != 'undefined' && rules[j].selectorText === cssSelector) {
                  isFound = true;
                  break sheetsLoop;
                }
              }
            }
          } catch (e) {
            continue;
          }
        }
      }

      return isFound;
    }
    /**
     * Initilize the chat window
     * @param {object} data
    */

  }, {
    key: 'setupChat',
    value: function setupChat(data) {
      data = this.formatData(data);

      if (data.assistantId === undefined || data.assistantSlug === undefined) {
        return null;
      }

      // Load Async css only if style sheet not found
      if (!this.isStyleSheetLoaded()) {
        this.loadCssAsync(data.assistantUrl);
      }
      
      this.createContainer();
      this.addAssistantImage();
      this.setUpChatIFrame(data);
      window.addEventListener('resize', this.handleOnResize.bind(this));
      this.triggerEvent(window, 'resize');

      document.getElementById('assistant_img').addEventListener('click', function (e) {
        document.getElementById('assistant_img').style.display = 'none';
        document.getElementById('yelda_iframe_container').style.display = 'block';
        document.getElementById('web_chat_frame').classList.add('y_active');
        var frame = document.getElementById('web_chat_frame');
        frame.contentWindow.postMessage('openChat', '*');
      });

      this.handleFrameListner();
    }
  }, {
    key: 'init',
    value: function init(data) {
      var _this2 = this;

      if (data.assistantId === undefined || data.assistantSlug === undefined) {
        return null;
      }

      window.onload = function (e) {
        _this2.setupChat(data);
      };
    }
  }]);

  return YeldaChat;
}();

var yeldaChat = new YeldaChat();

if (typeof window != 'undefined') {
  window.yeldaChat = yeldaChat;
}

/* harmony default export */ __webpack_exports__["default"] = (yeldaChat);

/***/ }),

/***/ "2GTP":
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__("eaoh");
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ "2faE":
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__("5K7Z");
var IE8_DOM_DEFINE = __webpack_require__("eUtF");
var toPrimitive = __webpack_require__("G8Mo");
var dP = Object.defineProperty;

exports.f = __webpack_require__("jmDH") ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "5K7Z":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("93I4");
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),

/***/ "5T2Y":
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),

/***/ "93I4":
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ "B+OT":
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ "G8Mo":
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__("93I4");
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "Hsns":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("93I4");
var document = __webpack_require__("5T2Y").document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),

/***/ "KUxP":
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),

/***/ "NegM":
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__("2faE");
var createDesc = __webpack_require__("rr1i");
module.exports = __webpack_require__("jmDH") ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "RU/L":
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__("Rqdy");
var $Object = __webpack_require__("WEpk").Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};


/***/ }),

/***/ "Rqdy":
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__("Y7ZC");
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__("jmDH"), 'Object', { defineProperty: __webpack_require__("2faE").f });


/***/ }),

/***/ "SEkw":
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__("RU/L"), __esModule: true };

/***/ }),

/***/ "V7oC":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _defineProperty = __webpack_require__("SEkw");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/***/ }),

/***/ "WEpk":
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };

if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),

/***/ "Y7ZC":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("5T2Y");
var core = __webpack_require__("WEpk");
var ctx = __webpack_require__("2GTP");
var hide = __webpack_require__("NegM");
var has = __webpack_require__("B+OT");
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),

/***/ "c39r":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "eUtF":
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__("jmDH") && !__webpack_require__("KUxP")(function () {
  return Object.defineProperty(__webpack_require__("Hsns")('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "eaoh":
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),

/***/ "iCc5":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/***/ }),

/***/ "jmDH":
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__("KUxP")(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "rr1i":
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ })

/******/ })["default"];
});
//# sourceMappingURL=yeldaWebchatInjector.js.map