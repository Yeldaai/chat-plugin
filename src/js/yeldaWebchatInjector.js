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

  /**
  * Create assistantImage element and add it to webChatContainer element
  */

  addAssistantImage () {
    if (!this.webChatContainer) {
      this.webChatContainer = document.getElementById('yelda_container')
    }

    // Removed the Assistant Img element if already rendered in the DOM
    if(document.getElementById('assistant_img')) {
      document.getElementById('assistant_img').remove()
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
    url = this.updateQueryStringParameter(url, 'openOnLoad', data.openOnLoad)

    if(data.isAdmin) {
      url = this.updateQueryStringParameter(url, 'isAdmin', data.isAdmin)
    }

    return url
  }

  /**
   * Create iframeContainer and it's child webchat iframe, and it to webChatContainer
   * @param {String} url webchat url
   * @return {Element} iframe HTML element
  */

  createWebChatFrame (url) {
    if (!this.webChatContainer) {
      this.webChatContainer = document.getElementById('yelda_container')
    }

    // Iframe creation
    // Parent div to contain the iframe. To allow css animation on iframe
    if (!this.iframeContainer) {
      this.iframeContainer = document.createElement('div')
      this.iframeContainer.setAttribute('id', 'yelda_iframe_container')
      this.iframeContainer.setAttribute('class', 'yelda_iframe_container')
      this.iframeContainer.style.cssText = 'display: none;'
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

  /**
   * handles communcation between parent window and iframe
  */
  handleFrameListner () {
    const eventMethod = window.addEventListener
      ? 'addEventListener'
      : 'attachEvent'
    const eventer = window[eventMethod]
    const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'
    eventer(messageEvent, (e) => {
      if (e.data === 'closeChat' || e.message === 'closeChat') {
        document.getElementById('web_chat_frame').classList.remove('y_active')
        setTimeout(function () {
          document.getElementById('assistant_img').style.display = 'block'
          document.getElementById('yelda_iframe_container').style.display = 'none'
        },
        1000)
      } else if (e.data === 'openChat' || e.message === 'openChat') {
        this.triggerEvent(document.getElementById('assistant_img'), 'click')
      }
    })
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
  */

  loadCssAsync () {
    const head = document.getElementsByTagName('head')[0]
    const yeldaCss = document.createElement('link')
    yeldaCss.rel = 'stylesheet'
    yeldaCss.type = 'text/css'
    yeldaCss.crossorigin = 'anonymous'
    yeldaCss.href = '/node_modules/yelda-webchat/dist/css/yeldaWebchatInjector.min.css'
    yeldaCss.media = 'all'
    head.appendChild(yeldaCss)
  }

  /**
   * Gererate webchatURL and create webchatIframe
   * @param {Object} data { data.chatUrl, data.assistantId, data.assistantSlug }
  */
  setUpChatIFrame (data) {
    const webchatUrl = this.createWebChatURL(data)
    this.webChatIframe = this.createWebChatFrame(webchatUrl)
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
    document.getElementById('assistant_img').style.display = 'block'
  }

  /**
   * Set default value for data object used for multiple init functions
   * @param {Object} data { data.assistantUrl, data.chatPath }
   * @param {Object} data
  */
  formatData (data) {
    data.assistantUrl = data.assistantUrl || 'https://app.yelda.ai/'
    data.chatPath = data.chatPath || ''
    data.chatUrl = data.assistantUrl + data.chatPath
    data.locale = data.locale || 'fr_FR'
    data.isAdmin = data.isAdmin ? true : false
    data.openOnLoad = data.openOnLoad ? true : false

    return data
  }

  /**
   * Initilize the chat window
   * @param {object} data
  */
  setupChat (data) {
    data = this.formatData(data)

    if(data.assistantId === undefined || data.assistantSlug === undefined) {
      return null
    }

    this.loadCssAsync()
    this.createContainer()
    this.addAssistantImage()
    this.setUpChatIFrame(data)
    window.addEventListener('resize', this.handleOnResize.bind(this))
    this.triggerEvent(window, 'resize')

    document
      .getElementById('assistant_img')
      .addEventListener('click', function (e) {
        document.getElementById('assistant_img').style.display = 'none'
        document.getElementById('yelda_iframe_container').style.display = 'block'
        document.getElementById('web_chat_frame').classList.add('y_active')
        const frame = document.getElementById('web_chat_frame')
        frame.contentWindow.postMessage('openChat', '*')
      })

    this.handleFrameListner()
  }

  init (data) {
    if(data.assistantId === undefined || data.assistantSlug === undefined) {
      return null
    }

    window.onload = (e) => {
      this.setupChat(data)
    }
  }
}

let yeldaChat = new YeldaChat()

if (typeof window != 'undefined') {
  window.yeldaChat = yeldaChat
}

export default yeldaChat