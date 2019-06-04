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
   * @param (String) container_id to which the iframe will be inserted
  */
  createContainer (parentContainerId) {
    // webChatContainer is the parent div to append the webchat iframe. It should not be created twice.
    if (this.webChatContainer) {
      return true
    }

    // If no parentContainerId or invalid one, fallback on document.body, add inner class and assistant image
    const parentContainer = parentContainerId && document.getElementById(parentContainerId) || document.body
    const classList =  parentContainer === document.body ? 'yelda_container' :  'yelda_container inner'

    this.webChatContainer = document.createElement('div')
    this.webChatContainer.setAttribute('id', 'yelda_container')
    this.webChatContainer.setAttribute('class', classList)
    parentContainer.appendChild(this.webChatContainer)

    if (parentContainer === document.body) {
      this.addAssistantImage()
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
    // Add click event to assistant image
    this.assistantImage.addEventListener('click', this.openChat)
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
      url = this.updateQueryStringParameter(url, 'isStartBtn', (data.isAdmin && data.isStartBtn))
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

      if (data.parentContainerId !== false) {
        // CSS class which contols the opacity and positin of the frame container
        classList += ' y_active inner'
      } else {
        // If the iframe inserted into the document body, hide it by default
        // in this y_active not needed since, it is handled in assistant_img click event
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
  /**
   * handles communcation between parent window and iframe, mainly for open and closing the chat
   * @param {event} e
   */
  messageListener (e) {
    if (document.getElementById('assistant_img') === null) {
      return false
    }
    if (e.data === 'closeChat' || e.message === 'closeChat') {
      document.getElementById('yelda_iframe_container').classList.remove('y_active')
        document.getElementById('assistant_img').style.display = 'block'
        document.getElementById('yelda_iframe_container').style.display = 'none'
    } else if (e.data === 'openChat' || e.message === 'openChat') {
      this.openChat()
    }
  }

  /**
   * toggle the event listener
   * @param {Boolean} is_add
   */
  toggleFrameListener (is_add) {
    let eventMethod
    const eventCondition = is_add ? 'attachEvent' : 'detachEvent'

    if (is_add) {
      eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'
    } else {
      eventMethod = window.removeEventListener ? 'removeEventListener' : 'detachEvent'
    }

    const eventer = window[eventMethod]
    const messageEvent = eventMethod === eventCondition ? 'onmessage' : 'message'
    this.messageListenerBind = this.messageListener.bind(this)
    eventer(messageEvent, this.messageListenerBind)
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
    this.unLoadChat()
    this.setupChat(data)
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
    data.isStartBtn = data.isStartBtn ? true : false
    data.shouldBeOpened = data.shouldBeOpened ? true : false
    data.canBeClosed = data.canBeClosed ? true : false

    // Assign parentContainerId only if the element presents else follow outer behavior
    if (
      !data.parentContainerId ||
      data.parentContainerId === undefined ||
      data.parentContainerId === null ||
      !document.getElementById(data.parentContainerId) ||
      typeof (document.getElementById(data.parentContainerId)) === undefined ||
      document.getElementById(data.parentContainerId) === null
    ) {
      data.parentContainerId = false
    } else {
      data.canBeClosed = false
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

    // Format the data with default values if not exists
    data = this.formatData(data)

    if (
      data.assistantId === undefined ||
      data.assistantSlug === undefined
    ) {
      return null
    }

    // Load Async css only if style sheet not found
    if ( ! this.isStyleSheetLoaded()) {
      this.loadCssAsync(data.assistantUrl)
    }

    // Create container for iframe
    this.createContainer(data.parentContainerId)

    // create the iframe and insert into iframe container
    this.setUpChatIFrame(data)

    // add the frame lister to receive message from iframe to the parent
    this.toggleFrameListener(true)
  }

  /**
   * opens the webchat window
   */
  openChat () {
    document.getElementById('assistant_img').style.display = 'none'
    document.getElementById('yelda_iframe_container').style.display = 'block'
    document.getElementById('yelda_iframe_container').classList.add('y_active')
    const frame = document.getElementById('web_chat_frame')
    frame.contentWindow.postMessage('openChat', '*')
  }

  /**
   * destroy the webchat window
   */
  unLoadChat () {
    this.toggleFrameListener(false)

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
