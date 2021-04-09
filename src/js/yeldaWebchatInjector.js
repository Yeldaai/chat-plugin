import '../css/yeldaWebchatInjector.css'
import MobileDetect from 'mobile-detect'
import 'lightgallery.js'
import 'lg-fullscreen.js'
import 'lg-zoom.js'
import 'lg-video.js'
import 'lg-share.js'
import 'lightgallery.js/dist/css/lightgallery.css'
import config from '../config'

class YeldaChat {
  /**
   * Updates the url with the given parameter and value
   * @param {String} uri
   * @param {String} key
   * @param {String} value
   */
  updateQueryStringParameter(uri, key, value) {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
    const separator = uri.indexOf('?') !== -1 ? '&' : '?'

    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2')
    } else {
      return uri + separator + key + '=' + value
    }
  }

  /**
   * gets all the url get parameters
   * @param {String} url current URL (document.location.href) or iframe parent url (document.referrer) if different from current location
   * @return {Object} key value list of GET parameters {parameterName: parameterValue}
   */
  getUrlVars(url) {
    const vars = {}
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(match, key, value) {
      vars[key] = value
    })

    return vars
  }

  /**
   * get Specific parameter from the url
   * @param {*} parameter
   * @param {*} defaultValue, default empty string
   * @return {String} urlParamter
   */
  getUrlParam(parameter, defaultValue = '', url = window.location.href) {
    let urlParameter = defaultValue

    if (url.indexOf(parameter) > -1) {
      urlParameter = this.getUrlVars(url)[parameter]
    }

    return urlParameter || defaultValue
  }

  /**
   * Create webChatContainer, which is the main div containing image and webchat elements
   * and add it to the DOM
   */
  createContainer() {
    // If the parentContainer (document.body) not loaded then do not proceed
    if (!this.parentContainer) {
      return null
    }

    // webChatContainer is the parent div to append the webchat iframe. It should not be created twice.
    if (this.webChatContainer) {
      return true
    }

    // add inner class and assistant image if the parentContainer is not document.body
    const classList = this.parentContainer === document.body ? 'yelda_container' : 'yelda_container inner'

    this.webChatContainer = document.createElement('div')
    this.webChatContainer.setAttribute('id', 'yelda_container')
    this.webChatContainer.setAttribute('class', classList)
    this.parentContainer.appendChild(this.webChatContainer)
  }

  /**
   * Create an assistantBubbleText component and add it to webChatContainer element
   */
  addAssistantBubbleText() {
    if (!this.webChatContainer || !this.webchatSettings || !this.webchatSettings.bubbleText) {
      return
    }

    // create assistantBubbleText element and set the text
    this.assistantBubbleText = document.createElement('span')
    this.assistantBubbleText.setAttribute('id', 'yelda_assistant_bubble_text')
    this.assistantBubbleText.innerText = this.webchatSettings.bubbleText

    // Add click event to assistant text
    this.assistantBubbleText.addEventListener('click', this.openChat)

    // add assistant text to webChatContainer using the webchatSettings
    this.webChatContainer.appendChild(this.assistantBubbleText)
  }

  /**
   * Create assistantImage element and add it to webChatContainer element
   */
  addAssistantImage() {
    if (!this.webChatContainer) {
      this.webChatContainer = document.getElementById('yelda_container')
    }

    // If it's already set up, keep it
    if (document.getElementById('yelda_assistant_img') !== null) {
      if (this.bubbleContainer) {
        document.getElementById('yelda_assistant_img').remove()
      } else {
        return
      }
    }

    // Assistant Image Creation
    this.assistantImage = document.createElement('div')

    // bubbleContainerChildId force the assistant image to be set in the bubbleContainer
    if (this.bubbleContainer) {
      this.assistantImage = this.bubbleContainer
    }

    // Assistant Image setup
    this.assistantImage.setAttribute('id', 'yelda_assistant_img')
    this.assistantImage.setAttribute('class', 'yelda_assistant_img default')
    this.assistantImage.innerHTML = '<i class="fas fa-comment"></i>'

    // Add click event to assistant image
    this.assistantImage.addEventListener('click', this.openChat)

    // add assistantImage to webChatContainer using the webchatSettings
    this.updateAssistantImageWithAssistantSettings()
  }

  /**
   * Add the assistantImage to the webChatContainer
   * Or update the webChatContainer element if the image is already added (bubbleContainerChildId param)
   */
  addAssistantImageToWebChatContainer() {
    if (this.bubbleContainer) {
      this.webChatContainer = this.assistantImage.parentElement
      return
    }

    this.webChatContainer.appendChild(this.assistantImage)
  }

  /**
   * Update assistantImage with assistant settings from backend if any
   */
  updateAssistantImageWithAssistantSettings() {
    if (!this.webChatContainer) {
      return
    }

    if (!this.webchatSettings) {
      this.addAssistantImageToWebChatContainer()
      return
    }

    const isVoiceFirstUI = this.webchatSettings.hasOwnProperty('isVoiceFirstUI')
      ? this.webchatSettings.isVoiceFirstUI
      : false
    const customImage = this.webchatSettings.image && this.webchatSettings.image.url
    const hasCustomStyle = this.webchatSettings.hasOwnProperty('isDefaultStyle') && !this.webchatSettings.isDefaultStyle

    /**
     * in isVoiceFirstUI mode
     * - the assistant should be opened directly and will never be closed
     * => we call directly openChat and do not add the assistant image
     * - we don't want the box-shadow css style
     *    => we add voiceFirstUI to iframeContainer
     * - /chat vue render the voice first UI
     *   => nothing more to do here
     */
    if (isVoiceFirstUI) {
      this.iframeContainer.classList.add('voiceFirstUI')
      this.openChat()
      this.assistantImage = null
      return
    }

    if (!hasCustomStyle || !customImage) {
      this.addAssistantImageToWebChatContainer()
      return
    }

    // If the device is mobile and mobile image url exists then use it
    const md = new MobileDetect(navigator.userAgent)
    const image = md.mobile() !== null && this.webchatSettings.mobileImage && this.webchatSettings.mobileImage.url
      ? this.webchatSettings.mobileImage.url
      : customImage

    this.assistantImage.classList.remove('default', 'custom')
    this.assistantImage.innerHTML = `<img src="${image}" alt="assistant">`
    this.assistantImage.classList.add('custom')

    this.addAssistantImageToWebChatContainer()
  }

  /**
   * Build webchat URL with necessary parameters
   * @param {String} url webchat url
   * @param {String} assistantId assistant id
   * @param {String} assistantSlug assistant slug
   * @return {String} url
   */
  createWebChatURL(data) {
    let url = data.chatUrl
    url = this.updateQueryStringParameter(url, 'assistantId', data.assistantId)
    url = this.updateQueryStringParameter(url, 'assistantSlug', data.assistantSlug)
    url = this.updateQueryStringParameter(url, 'locale', data.locale)
    url = this.updateQueryStringParameter(url, 'location', data.location)

    if (data.platformSimulated) {
      url = this.updateQueryStringParameter(url, 'platformSimulated', data.platformSimulated)
    }
    if (data.hasOwnProperty('canBeClosed')) {
      url = this.updateQueryStringParameter(url, 'canBeClosed', data.canBeClosed)
    }

    if (data.hasOwnProperty('shouldBeOpened')) {
      url = this.updateQueryStringParameter(url, 'shouldBeOpened', data.shouldBeOpened)
    }

    if (data.isAdmin) {
      url = this.updateQueryStringParameter(url, 'isAdmin', data.isAdmin)
    }

    if (data.isStartBtn) {
      url = this.updateQueryStringParameter(url, 'isStartBtn', data.isAdmin && data.isStartBtn)
    }

    if (data.isDemo) {
      url = this.updateQueryStringParameter(url, 'isDemo', data.isDemo)
    }

    if (data.hasOwnProperty(config.YELDA_PARAMETER)) {
      url = this.updateQueryStringParameter(url, config.YELDA_PARAMETER, data[config.YELDA_PARAMETER])
    }

    return url
  }

  /**
   * Create iframeContainer and it's child webchat iframe, and add it to webChatContainer
   * @param {String} url webchat url
   * @param {Boolean} data.shouldBeOpened
   * @param {Boolean} data.isStartBtn
   * @param {Boolean} data.canBeClosed
   * @return {Element} iframe HTML element
   */
  createWebChatFrame(url, data) {
    if (!this.webChatContainer) {
      this.webChatContainer = document.getElementsByClassName('yelda_container')[0]
    }

    // Iframe creation
    // Parent div to contain the iframe. To allow css animation on iframe
    if (!this.iframeContainer) {
      let classList = 'yelda_iframe_container'

      this.iframeContainer = document.createElement('div')
      this.iframeContainer.setAttribute('id', 'yelda_iframe_container')

      // Add the inner class that controls the position of the iframe container if the parent container is not document.body
      if (this.parentContainer !== document.body) {
        classList += ' inner'
      }

      /**
       * add CSS class which controls the opacity of the frame container if the iframe:
       * - should be opened on load OR has a start button
       * - cannot be closed (canBeClosed explicitely set to false)
       *
       * If we are sure that the webchat should be opened and displayed all the time, we can add the y_active class right away
       * Otherwise,
       */
      if ((data.shouldBeOpened || data.isStartBtn) && data.hasOwnProperty('canBeClosed') && !data.canBeClosed) {
        classList += ' y_active'
      } else {
        /**
         * If the iframe can be closed, hide it by default
         * yelda_assistant_img click event management will take care of showing and hiding the webchat
         * And if it should be opened, the webchat will trigger the 'openChat' event on its own
         */
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
      iframe.setAttribute('allow', 'microphone;')
      iframe.setAttribute('allowfullscreen', 'true')
      iframe.setAttribute('webkitallowfullscreen', 'true')
      iframe.setAttribute('mozallowfullscreen', 'true')
      this.iframeContainer.appendChild(iframe)
    } else {
      iframe = document.getElementById('web_chat_frame')
    }

    return iframe
  }

  /**
   * Format object with social media shareUrl
   * @param {String} shareUrl url to share
   * @return {Object} shareUrl properties { facebookShareUrl, twitterShareUrl, pinterestShareUrl }
   */
  getSharedUrlProperties(shareURL) {
    return {
      facebookShareUrl: shareURL,
      twitterShareUrl: shareURL,
      pinterestShareUrl: shareURL
    }
  }

  /**
   * Get Image related properties for lightGallery
   * @param {String} mediaSource image url
   * @return {Object} object of image needed properties {src, href, facebookShareUrl, twitterShareUrl, pinterestShareUrl }
   */
  getImageProperties(mediaSource) {
    return {
      src: mediaSource,
      href: mediaSource,
      ...this.getSharedUrlProperties(mediaSource) // { facebookShareUrl, twitterShareUrl, pinterestShareUrl }
    }
  }

  /**
   * Get Video related properties for lightGallery
   * @param {Object} mediaSource video properties
   * @param {Array<String>} mediaSource.urls videos urls
   * @param {String | null} mediaSource.cover image cover, optional
   * @return {Object} object of video needed properties {html, href, facebookShareUrl, twitterShareUrl, pinterestShareUrl }
   */
  getVideoProperties(mediaSource) {
    const videoSources = mediaSource.urls.reduce((acc, url) => {
      return `${acc}<source src="${url}"></source>`
    }, '')

    return {
      html: `<video class="lg-video-object lg-html5" controls="true" preload="none">${videoSources}</video>`,
      href: mediaSource.urls[0],
      ...(mediaSource.cover && {
        poster: mediaSource.cover // optional video cover preview
      }),
      ...this.getSharedUrlProperties(mediaSource.urls[0]) // { facebookShareUrl, twitterShareUrl, pinterestShareUrl }
    }
  }

  /**
   * Handles communcation between parent window and iframe, mainly for open and closing the chat
   * handles also the chat bubble style
   * @param {event} event
   */
  messageListener(event) {
    if (event.data === 'closeChat' || event.message === 'closeChat') {
      this.closeChat()
      return
    }

    if (event.data === 'openChat' || event.message === 'openChat') {
      this.openChat()
      return
    }

    if (event.data && event.data.event && event.data.event === 'openLightGallery') {
      if (!event.data.mediaSources || !event.data.mediaSources.length) {
        return
      }

      this.handleLightGallery(event.data)
      return
    }

    /**
     * Custom event to send to Yelda to keep track of the webchat ability to receive a new message
     * If isSendingMessage data is true, it means that a user message has already been sent to the webchat and
     * is still waiting for an answer
     * If isSendingMessage data is false, the webchat is ready to receive new user messages
     */
    if (event.data && event.data.event && event.data.event === 'isSendingMessage') {
      if (event.data.hasOwnProperty('data')) {
        window.dispatchEvent(new CustomEvent('isSendingMessage', { detail: event.data.data }))
      }
      return
    }
  }

  /**
   * Create DynamicElements & Opens Light Gallery from the received mediaSources
   * @param {Object} data - iframe data sent from webchat window
   * @param {Array<String | Object>} data.mediaSources - Array of source for image or video
   */
  handleLightGallery(data) {
    // Get lightgallery container
    let lightgalleryContainer = document.getElementById('lightgallery')

    // If lightgalleryContainer does not exit, then create it
    if (!lightgalleryContainer) {
      lightgalleryContainer = document.createElement('div')
      lightgalleryContainer.id = 'lightgallery'
      document.getElementById('yelda_iframe_container').appendChild(lightgalleryContainer)
    }

    // Create dynamic Elements from the mediaSources for the lightgallery
    const dynamicElements = data.mediaSources.map(mediaSource => {
      let mediaDetails = {}

      // For image the mediaSource is a simple string
      if (typeof mediaSource === 'string') {
        mediaDetails = this.getImageProperties(mediaSource)
      } else if (mediaSource.urls && mediaSource.urls.length) {
        // For video mediaSource will be object {urls: {Array<String>}, cover: {String}}
        mediaDetails = this.getImageProperties(mediaSource)
      }

      return {
        tweetText: '', // Empty string used to avoid undefined message showed in the twitter share window
        pinterestText: '',
        ...mediaDetails
      }
    })

    // Open Light gallery
    window.lightGallery(lightgalleryContainer, {
      googlePlus: false, // Don't show the googlePlus share button
      dynamic: true,
      dynamicEl: dynamicElements,
      index: data.index || 0 // Opens directly the clicked image/video or the first element in gallery
    })

    // Clean the light gallery on close
    lightgalleryContainer.addEventListener('onCloseAfter', function() {
      lightgalleryContainer.remove()
    })
  }

  /**
   * Close the webchat window
   */
  closeChat() {
    const assistantImgElement = document.getElementById('yelda_assistant_img')
    if (assistantImgElement !== null) {
      assistantImgElement.style.display = 'inline-block'
    }

    const yeldaIframeContainerElement = document.getElementById('yelda_iframe_container')
    if (yeldaIframeContainerElement !== null) {
      yeldaIframeContainerElement.classList.remove('y_active')
      yeldaIframeContainerElement.style.display = 'none'
    }
  }

  /**
   * Open the webchat window
   */
  openChat() {
    const assistantImgElement = document.getElementById('yelda_assistant_img')
    if (assistantImgElement !== null) {
      assistantImgElement.style.display = 'none'
    }

    const yeldaIframeContainerElement = document.getElementById('yelda_iframe_container')
    if (yeldaIframeContainerElement !== null) {
      yeldaIframeContainerElement.style.display = 'block'
      yeldaIframeContainerElement.classList.add('y_active')
    }

    // Propagate the event to the webchat
    document.getElementById('web_chat_frame').contentWindow.postMessage('openChat', '*')
  }

  /**
   * Attach or remove the event listener
   *
   * @param {Boolean} remove - If we are removing the event listener
   */
  toggleFrameListener(remove = false) {
    const isOldIEVersion = !window.addEventListener

    const addEventMethod = isOldIEVersion ? 'attachEvent' : 'addEventListener'
    const removeEventMethod = isOldIEVersion ? 'detachEvent' : 'removeEventListener'
    const messageEvent = isOldIEVersion ? 'onmessage' : 'message'

    const eventHandler = window[remove ? removeEventMethod : addEventMethod]

    this.messageListenerBind = this.messageListener.bind(this)
    eventHandler(messageEvent, this.messageListenerBind)
  }

  /**
   * Load CSS asynchroneously
   * @param {String} origin to retrive css
   */
  loadCssAsync(origin) {
    const head = document.getElementsByTagName('head')[0]
    const yeldaCss = document.createElement('link')
    yeldaCss.rel = 'stylesheet'
    yeldaCss.type = 'text/css'
    yeldaCss.crossorigin = 'anonymous'
    yeldaCss.href = origin + '/static/css/yeldaWebchatInjector.min.css'
    yeldaCss.media = 'all'
    head.appendChild(yeldaCss)
  }

  /**
   * Gererate webchatURL and create webchatIframe
   * @param {Object} data { chatUrl, assistantId, assistantSlug, shouldBeOpened, isStartBtn, canBeClosed }
   */
  setUpChatIFrame(data) {
    const webchatUrl = this.createWebChatURL(data)
    this.webChatIframe = this.createWebChatFrame(webchatUrl, data)
  }

  /**
   * Delete old webchat element and create new webchat
   * @param {Object} data { data.assistantUrl, data.chatPath }
   * @param {Element} container webchat container
   * @returns {Promise}
   */
  resetChat(data) {
    return new Promise(async resolve => {
      this.unLoadChat()
      await this.setupChat(data)
      resolve()
    })
  }

  /**
   * Set default value for data object used for multiple init functions
   * @param {Object} data { data.assistantUrl, data.chatPath }
   * @param {Object} data
   */
  formatData(data) {
    const assistantUrl = data.assistantUrl || 'https://app.yelda.ai'
    const chatPath = data.chatPath || ''

    /*
      Formatting the url to remove trailing slash
      This avoids problems with missing or duplicating slashes when composing other urls with them
    */
    data.assistantUrl = assistantUrl.replace(/\/$/, '')
    data.chatPath = chatPath.replace(/^\//, '')
    data.chatUrl = `${data.assistantUrl}/${data.chatPath}`
    data.locale = data.locale || 'fr_FR'
    data.isAdmin = data.isAdmin ? true : false
    data.isStartBtn = data.isStartBtn ? true : false
    data.isDemo = data.isDemo ? true : false
    data.location = encodeURIComponent(window.location.href)

    if (data.hasOwnProperty('shouldBeOpened')) {
      data.shouldBeOpened = data.shouldBeOpened ? true : false
    }

    // Check if the YELDA_PARAMETER(yparam) parameter exists in the url then add it to the data
    const yeldaParam = this.getUrlParam(config.YELDA_PARAMETER, null)

    if (yeldaParam && yeldaParam !== '') {
      data[config.YELDA_PARAMETER] = yeldaParam
    }

    if (data.hasOwnProperty('canBeClosed')) {
      data.canBeClosed = data.canBeClosed ? true : false
    }

    // default container
    this.parentContainer = document.body
    this.bubbleContainer = null
    this.bubbleContainerClone = null

    if (data.bubbleContainerChildId && document.getElementById(data.bubbleContainerChildId)) {
      this.bubbleContainer = document.getElementById(data.bubbleContainerChildId).parentElement

      /**
       * if the bubbleContainer exists take the clone of the bubbleContainerChildId's parentElement,
       * so that it can be restored on unLoadChat function
       */
      if (this.bubbleContainer) {
        this.bubbleContainerClone = document.getElementById(data.bubbleContainerChildId).parentElement.cloneNode(true)
      }
    }

    // If parentContainerId presents and valid one, set parentContainer
    if (data.parentContainerId && document.getElementById(data.parentContainerId)) {
      this.parentContainer = document.getElementById(data.parentContainerId)
      // Don't overwrite canBeClosed if it has been explicitly set in the webchat config
      // However, if canBeClosed is not provided but the parentContainerId is provided, force it to false
      data.canBeClosed = data.hasOwnProperty('canBeClosed') ? data.canBeClosed : config.CAN_BE_CLOSED_WITH_PARENT_ID
    }

    return data
  }

  isStyleSheetLoaded() {
    const sheets = document.styleSheets
    let isFound = false
    const cssSelector = '.yelda_assistant_img' // Used to check style sheet loaded or not

    if (typeof sheets !== 'undefined' && sheets.length) {
      sheetsLoop: for (let i = 0; i < sheets.length; i++) {
        const sheet = document.styleSheets[i]

        try {
          const rules = sheet.cssRules
          if (typeof rules !== 'undefined') {
            for (let j = 0; j < rules.length; j++) {
              if (typeof rules[j].selectorText !== 'undefined' && rules[j].selectorText === cssSelector) {
                isFound = true
                break sheetsLoop
              }
            }
          }
        } catch (e) {
          continue
        }
      }
    }

    return isFound
  }

  /**
   * Update assistantImage with assistant settings from backend if any
   * @param {Object} data { data.assistantUrl, data.assistantId }
   * @return {Promise}
   */
  getAssistantSettings(data) {
    return new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest()
        const url = `${data.assistantUrl}/assistants/${data.assistantId}/chatBubble/${data.locale}`

        xhr.open('GET', url)
        xhr.send()

        // Bind and call are necessary to pass the "this" to the callback function
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            const webchatSettings = xhr.responseText ? JSON.parse(xhr.responseText).data : null
            resolve(webchatSettings)
          }
        }
      } catch (e) {
        // when json.parse fails or xhr onerror catch will be called
        reject()
      }
    })
  }

  /**
   * Initialize the chat window
   * @param {object} data
   */
  setupChat(data) {
    return new Promise(async resolve => {
      if (document.getElementById('yelda_container') || document.getElementById('yelda_iframe_container')) {
        return resolve()
      }

      this.webChatContainer = null
      this.iframeContainer = null
      this.webChatIframe = null
      this.webchatSettings = null

      // Format the data with default values if not exists
      data = this.formatData(data)

      if (data.assistantId === undefined || data.assistantSlug === undefined) {
        return resolve()
      }

      // Get assistant settings from backend
      try {
        this.webchatSettings = await this.getAssistantSettings(data)
      } catch (err) {
        this.webchatSettings = null
      }

      this.loadChat(data)
      return resolve()
    })
  }

  /**
   * Check the webchat can be loaded
   * @param {Object} webchatSettings
   * @param {Object} data - iframe data sent from webchat window
   * @returns {Boolean}
   */
  shouldChatBeLoaded(webchatSettings, data) {
    // if bubbleContainerChildId has been set but there is no element in the DOM matching this id
    // the chat should not be loaded
    if (data && data.bubbleContainerChildId && (!document.getElementById(data.bubbleContainerChildId) || !document.getElementById(data.bubbleContainerChildId).parentElement)) {
      return false
    }

    // if webchatSettings is null load the chat
    if (!webchatSettings) {
      return true
    }

    // Chat should always be loaded on ALWAYS_ALLOWED_SITES list of domain
    const currentHost = window.location.hostname
    if (config.ALWAYS_ALLOWED_SITES_REGEX.test(currentHost)) {
      return true
    }

    // if webchat publication status is set to false, we should not load it
    if (webchatSettings.hasOwnProperty('isActivated') && !webchatSettings.isActivated) {
      return false
    }

    return true
  }

  /**
   * Load the chat after getting the webchat settings if publication is enabled
   * @param {Object} data { data.assistantUrl, data.assistantId }
   */
  loadChat(data) {
    if (!this.shouldChatBeLoaded(this.webchatSettings, data)) {
      this.unLoadChat()
      return
    }

    // Load Async css only if style sheet not found
    if (!this.isStyleSheetLoaded()) {
      this.loadCssAsync(data.assistantUrl)
    }

    if (!document.body || !this.parentContainer) {
      console.warn('document.body is not ready, please use yelda.init instead of yelda.setupChat or move the code in the page body')
      return null
    }

    // Create container for iframe
    this.createContainer()

    // create the iframe and insert into iframe container
    this.setUpChatIFrame(data)

    // Add assistant image if the webchat can be closed
    // Otherwise we will be able to close the webchat but not open it again
    // Or the image will not be initialized on load at all
    // because the assistant image containing the openChat event wouldn't have been created
    if (!data.hasOwnProperty('canBeClosed') || data.canBeClosed) {
      this.addAssistantImage()
      this.addAssistantBubbleText()
    }

    // add the frame lister to receive message from iframe to the parent
    this.toggleFrameListener()
  }

  /**
   * destroy the webchat window
   */
  unLoadChat() {
    this.toggleFrameListener(true)

    if (this.assistantImage) {
      // If bubbleContainer exists instead of removing the assistantImage dom, replace with the original dom of bubbleContainer
      if (this.bubbleContainer) {
        this.assistantImage.removeAttribute('id', 'yelda_assistant_img')
        this.assistantImage.removeAttribute('class', 'yelda_assistant_img default')
        this.assistantImage.removeEventListener('click', this.openChat)
        this.assistantImage.replaceWith(this.bubbleContainerClone)
      } else {
        this.removeElements('yelda_assistant_img')
      }
    }

    if (this.assistantBubbleText) {
      this.removeElements('yelda_assistant_bubble_text')
    }

    if (this.webChatContainer) {
      this.removeElements('yelda_container')
    }

    /**
     * If init or setupChat has been called multiple times we might end up with multiple yelda_iframe_container and yelda_container
     * So to be sure that the destroy the webchat window completely, let's find all the matching elements and remove them all
     */
    if (this.iframeContainer) {
      this.removeElements('yelda_iframe_container')
    }

    this.assistantBubbleText = null
    this.bubbleContainerClone = null
    this.bubbleContainer = null
    this.assistantImage = null
    this.iframeContainer = null
    this.webChatIframe = null
    this.webChatContainer = null
    this.parentContainer = null
    this.webchatSettings = null
  }

  /**
   * Remove dom elements
   * @param {String} id
   */
  removeElements(id) {
    for (const element of document.querySelectorAll(`[id='${id}']`)) {
      element.remove()
    }
  }

  init(data) {
    return new Promise(async resolve => {
      if (data.assistantId === undefined || data.assistantSlug === undefined) {
        return resolve()
      }

      // if the DOM is already ready, call setupChat
      if (document.readyState === 'complete') {
        await this.setupChat(data)
        return resolve()
      }

      // If the DOM is not yet ready, wait
      window.onload = async () => {
        await this.setupChat(data)
        return resolve()
      }
    })
  }

  /**
   * Send a user message to the webchat
   */
  sendMessageToChat(message) {
    const webchatFrame = document.getElementById('web_chat_frame')
    if (webchatFrame) {
      this.openChat()
      webchatFrame.contentWindow.postMessage({ event: 'sendUserMessage', data: message })
    }
  }
}

let yeldaChat = new YeldaChat()

if (typeof window !== 'undefined') {
  window.yeldaChat = yeldaChat
}

export default yeldaChat
