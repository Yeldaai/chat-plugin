import '../css/yeldaWebchatInjector.css'

class YeldaChat {
  /**
   * Updates the url with the given parameter and value
   * @param {String} uri
   * @param {String} key
   * @param {String} value
   */
  updateQueryStringParameter (uri, key, value) {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
    const separator = uri.indexOf('?') !== -1 ? '&' : '?'

    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2')
    } else {
      return uri + separator + key + '=' + value
    }
  }

  /**
   * Create webChatContainer, which is the main div containing image and webchat elements
   * and add it to the DOM
  */
  createContainer () {
    // Parent div to append the iframe
    if (!this.webChatContainer) {
      this.webChatContainer = document.createElement('div')
      this.webChatContainer.setAttribute('id', 'yelda_container')
      this.webChatContainer.setAttribute('class', 'yelda_container')
      document.body.appendChild(this.webChatContainer)
    }
  }

  setUpParentContainer (id_parent) {
    // Parent div to append the iframe
    if (!this.webChatContainer) {
      this.webChatContainer = document.createElement('div')
      this.webChatContainer.setAttribute('id', 'yelda_container')
      this.webChatContainer.setAttribute('class', 'yelda_container inner')

      const parent = document.getElementById(id_parent)

      if (typeof(parent) !== undefined && parent !== null) {
        parent.appendChild(this.webChatContainer)
      }
    }
  }

  /**
  * Create assistantImage element and add it to webChatContainer element
  */
  addAssistantImage () {
    if (!this.webChatContainer) {
      this.webChatContainer = document.getElementById('yelda_container')
    }

    // If it's already set up, keep it
    if (document.getElementById('assistant_img') !== null) {
      return
    }

    // Assistant Image Creation
    this.assistantImage = document.createElement('div')
    this.assistantImage.setAttribute('id', 'assistant_img')
    this.assistantImage.setAttribute('class', 'assistant_img')
    this.assistantImage.innerHTML = '<i class="fas fa-comment"></i>'
    this.webChatContainer.appendChild(this.assistantImage)
  }

  /**
   * Build webchat URL with necessary parameters
   * @param {String} url webchat url
   * @param {String} assistantId assistant id
   * @param {String} assistantSlug assistant slug
   * @return {String} url
  */
  createWebChatURL (data) {
    let url = data.chatUrl
    url = this.updateQueryStringParameter(url, 'assistantId', data.assistantId)
    url = this.updateQueryStringParameter(url, 'assistantSlug', data.assistantSlug)
    url = this.updateQueryStringParameter(url, 'locale', data.locale)
    url = this.updateQueryStringParameter(url, 'canBeClosed', data.canBeClosed)
    url = this.updateQueryStringParameter(url, 'shouldBeOpened', data.shouldBeOpened)

    if (data.isAdmin) {
      url = this.updateQueryStringParameter(url, 'isAdmin', data.isAdmin)
    }

    if (data.isStartBtn) {
      url = this.updateQueryStringParameter(url, 'isStartBtn', data.isStartBtn)
    }

    return url
  }

  /**
   * Create iframeContainer and it's child webchat iframe, and it to webChatContainer
   * @param {String} url webchat url
   * @return {Element} iframe HTML element
  */

  createWebChatFrame (url, data) {
    if (!this.webChatContainer) {
      this.webChatContainer = document.getElementsByClassName('yelda_container')[0]
    }

    // Iframe creation
    // Parent div to contain the iframe. To allow css animation on iframe
    if (!this.iframeContainer) {
      let classList = 'yelda_iframe_container'

      this.iframeContainer = document.createElement('div')
      this.iframeContainer.setAttribute('id', 'yelda_iframe_container')

      if (data.framePosition === 'inner') {
        classList += ' y_active'
      } else {
        this.iframeContainer.style.cssText = 'display: none;'
      }

      this.iframeContainer.setAttribute('class', classList)
      this.webChatContainer.appendChild(this.iframeContainer)
    }

    let iframe

    if (!this.webChatIframe) {
      iframe = document.createElement('iframe')
      iframe.src = url
      iframe.id = 'web_chat_frame'
      iframe.name = 'frame'
      iframe.style.border = '0'
      this.iframeContainer.appendChild(iframe)
    } else {
      iframe = document.getElementById('web_chat_frame')
    }

    return iframe
  }
  /**
   * Triggers event on the target
  */
  triggerEvent (target, event) {
    if (typeof Event === 'function') {
      // modern browsers
      target.dispatchEvent(new Event(event))
    } else {
      // This will be executed on old browsers and especially IE
      const customEvent = window.document.createEvent('UIEvents')
      customEvent.initUIEvent(event, true, false, window, 0)
      target.dispatchEvent(customEvent)
    }
  }

  messageListener (e) {
    if (
      (e.data === 'closeChat' || e.message === 'closeChat')
      && document.getElementById('assistant_img') !== null
    ) {
      document.getElementById('yelda_iframe_container').classList.remove('y_active')
      setTimeout(function () {
        document.getElementById('assistant_img').style.display = 'block'
        document.getElementById('yelda_iframe_container').style.display = 'none'
      },
      1000)
    } else if (
      (e.data === 'openChat' || e.message === 'openChat')
      && document.getElementById('assistant_img') !== null
    ) {
      this.triggerEvent(document.getElementById('assistant_img'), 'click')
    }
  }
  /**
   * handles communcation between parent window and iframe
  */
  handleFrameListener () {
    const eventMethod = window.addEventListener
      ? 'addEventListener'
      : 'attachEvent'
    const eventer = window[eventMethod]
    const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'
    this.messageListenerBind = this.messageListener.bind(this)
    eventer(messageEvent, this.messageListenerBind)
  }

  /**
   * removes the event listener
   */
  removeFrameListener () {
    const eventMethod = window.addEventListener
      ? 'removeEventListener'
      : 'detachEvent'
    const eventer = window[eventMethod]
    const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'
    eventer(messageEvent, this.messageListenerBind)
  }

  /**
   * handles window resize event by adding and removing class based on window width
  */
  handleOnResize () {
    if (window.outerWidth < 768) {
      const w = window
      const d = document
      const e = d.documentElement
      const g = d.getElementsByTagName('body')[0]
      const x = w.innerWidth || e.clientWidth || g.clientWidth
      const y = w.innerHeight || e.clientHeight || g.clientHeight

      this.webChatContainer.classList.add('yelda_mobile')
      this.webChatIframe.style.width = x + 'px'
      this.webChatIframe.style.height = y + 'px'
    } else {
      this.webChatContainer.classList.remove('yelda_mobile')
    }
  }

  /**
   * Load CSS asynchroneously
   * @param {String} origin to retrive css
  */

  loadCssAsync (origin) {
    const head = document.getElementsByTagName('head')[0]
    const yeldaCss = document.createElement('link')
    yeldaCss.rel = 'stylesheet'
    yeldaCss.type = 'text/css'
    yeldaCss.crossorigin = 'anonymous'
    yeldaCss.href = origin + '/static/css/injector.min.css'
    yeldaCss.media = 'all'
    head.appendChild(yeldaCss)
  }

  /**
   * Gererate webchatURL and create webchatIframe
   * @param {Object} data { data.chatUrl, data.assistantId, data.assistantSlug }
  */
  setUpChatIFrame (data) {
    const webchatUrl = this.createWebChatURL(data)
    this.webChatIframe = this.createWebChatFrame(webchatUrl, data)
  }

  /**
   * Delete old webchat element and create new webchat
   * @param {Object} data { data.assistantUrl, data.chatPath }
   * @param {Element} container webchat container
  */
  resetChat (data) {
    if (this.iframeContainer) {
      this.iframeContainer.remove() // Remove the element from the DOM tree its belongs
    }

    this.iframeContainer = null
    this.webChatIframe = null
    data = this.formatData(data)
    this.setUpChatIFrame(data)

    const assistantImage = document.getElementById('assistant_img')
    if (assistantImage !== null) {
      assistantImage.style.display = 'block'
    }
  }

  /**
   * Set default value for data object used for multiple init functions
   * @param {Object} data { data.assistantUrl, data.chatPath }
   * @param {Object} data
  */
  formatData (data) {
    const validFramePosition = ['inner', 'outer']
    data.assistantUrl = data.assistantUrl || 'https://app.yelda.ai/'
    data.chatPath = data.chatPath || ''
    data.chatUrl = data.assistantUrl + data.chatPath
    data.locale = data.locale || 'fr_FR'
    data.isAdmin = data.isAdmin ? true : false
    data.isStartBtn = data.isStartBtn ? true : false
    data.shouldBeOpened = data.shouldBeOpened ? true : false
    data.canBeClosed = data.canBeClosed ? true : false

    if (!data.framePosition || validFramePosition.indexOf(data.framePosition) === -1) {
      data.framePosition = 'outer'
    }

    return data
  }

  isStyleSheetLoaded () {
    const sheets = document.styleSheets
    let isFound = false
    const cssSelector = '.assistant_img i' // Used to check style sheet loaded or not

    if (typeof sheets != 'undefined' && sheets.length) {
      sheetsLoop:
      for (let i = 0; i < sheets.length; i++) {
        const sheet = document.styleSheets[i];

        try {
          const rules = sheet.cssRules
          if (typeof rules != 'undefined') {
            for (let j = 0; j < rules.length; j++) {
              if (typeof rules[j].selectorText != 'undefined' && rules[j].selectorText === cssSelector) {
                isFound = true
                break sheetsLoop
              }
            }
          }
        }
        catch (e) {
          continue
        }
      }
    }

    return isFound
  }
  /**
   * Initialize the chat window
   * @param {object} data
  */
  setupChat (data) {
    this.webChatContainer = null
    this.iframeContainer = null
    this.webChatIframe = null

    data = this.formatData(data)

    if (
      data.assistantId === undefined ||
      data.assistantSlug === undefined ||
      (data.framePosition === 'inner' && data.parent === undefined)
    ) {
      return null
    }

    // Load Async css only if style sheet not found
    if ( ! this.isStyleSheetLoaded()) {
      this.loadCssAsync(data.assistantUrl)
    }

    if (data.framePosition === 'outer') {
      this.createContainer()
      this.addAssistantImage()
    } else {
      this.setUpParentContainer(data.parent)
    }

    this.setUpChatIFrame(data)
    this.handleOnResizeBind = this.handleOnResize.bind(this)
    window.addEventListener('resize', this.handleOnResizeBind, true)
    this.triggerEvent(window, 'resize')

    if (data.framePosition === 'outer') {
      document
        .getElementById('assistant_img')
        .addEventListener('click', function () {
          document.getElementById('assistant_img').style.display = 'none'
          document.getElementById('yelda_iframe_container').style.display = 'block'
          document.getElementById('yelda_iframe_container').classList.add('y_active')
          const frame = document.getElementById('web_chat_frame')
          frame.contentWindow.postMessage('openChat', '*')
        })
    }

    this.handleFrameListener()
  }

  unLoadChat () {
    window.removeEventListener('resize', this.handleOnResizeBind, true)
    this.removeFrameListener()

    if (this.iframeContainer) {
      this.iframeContainer.remove() // Remove the element from the DOM tree its belongs
    }

    if (this.webChatContainer) {
      this.webChatContainer.remove()
    }

    this.iframeContainer = null
    this.webChatIframe = null
    this.webChatContainer = null
  }

  init (data) {
    if (data.assistantId === undefined || data.assistantSlug === undefined) {
      return null
    }

    window.onload = () => {
      this.setupChat(data)
    }
  }
}

let yeldaChat = new YeldaChat()

if (typeof window != 'undefined') {
  window.yeldaChat = yeldaChat
}

export default yeldaChat
