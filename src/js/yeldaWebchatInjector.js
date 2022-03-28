import '../css/yeldaWebchatInjector.css'
import MobileDetect from 'mobile-detect'
import 'lightgallery.js'
import 'lg-fullscreen.js'
import 'lg-zoom.js'
import 'lg-video.js'
import 'lg-share.js'
import 'lightgallery.js/dist/css/lightgallery.min.css'
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
   * @return {String} urlParameter
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
   * @param {String} text - default null
   * @param {String} cssClass - default ''
   */
  addAssistantBubbleText(text = null, cssClass = '') {
    text = text || this.webchatSettings && this.webchatSettings.bubbleText
    if (!this.webChatContainer || !text) {
      return
    }

    // Remove the assistant bubble text element before adding a new one
    this.removeElement('yelda_assistant_bubble_text')
    // create assistantBubbleText element and set the text
    this.assistantBubbleText = document.createElement('span')
    this.assistantBubbleText.setAttribute('id', 'yelda_assistant_bubble_text')
    this.assistantBubbleText.setAttribute('class', cssClass)
    this.assistantBubbleText.innerText = text
    this.addCloseButtonForBubbleText()

    // Add click event to assistant text
    this.assistantBubbleText.addEventListener('click', this.openChat.bind(this))

    // add assistant text to webChatContainer using the webchatSettings
    this.webChatContainer.appendChild(this.assistantBubbleText)
  }

  /**
   * Add close button for bubble text
   */
  addCloseButtonForBubbleText() {
    // Create close button and add it to the bubble text container
    const closeButton = document.createElement('a')
    closeButton.setAttribute('class', 'bubbleCloseButton')
    closeButton.setAttribute('id', 'yelda_assistant_bubble_text_close')
    closeButton.setAttribute('href', '#')
    closeButton.innerHTML = '&times;'
    closeButton.onclick = this.closeBubbleText.bind(this)
    this.assistantBubbleText.prepend(closeButton)
  }

  /**
   * Callback function for bubble text close button
   * @param {Event} event
   */
  closeBubbleText(event) {
    event.preventDefault()
    event.stopPropagation()
    this.removeElement('yelda_assistant_bubble_text')
    this.assistantBubbleText = null
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
    this.assistantImage.addEventListener('click', this.openChat.bind(this))

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
   * Add 'y_active' class to the webChatContainer if required
   *
   * To control the opacity/display of the iframe container (.yelda_iframe_container) and the assistant image (.yelda_assistant_img),
    * We add and remove the "y_active" CSS class to the webChatContainer (.yelda_container) which is always visible
    * By default
    * - yelda_iframe_container is hidden (opacity: 0; height:0; width: 0; to not affect page interactions)
    * - assistant image is hidden (opacity: 0), but immediatly animated by css to be displayed (opacity: 1 with animation-name: appear;) for yelda_assistant_img)
    *
    * When we add the class "y_active" to  (webChatContainer)
    * - yelda_iframe_container is now visible (.y_active .yelda_iframe_container => opacity: 1)
    * - the assistant image is hidden (.yelda_container.y_active .yelda_assistant_img => display:none, no opacity manipulation because no need of animation)
    *
    * @param {Boolean} data.shouldBeOpened
    * @param {Boolean} data.isStartBtn
    * @param {Boolean} data.canBeClosed
    */
  initWebChatContainerYActiveClass(data) {
      // should be opened on load OR has a start button
      const shoulBeOpened = data.shouldBeOpened || data.isStartBtn

      // cannot be closed (canBeClosed explicitly set to false)
      const cantBeClosed = data.hasOwnProperty('canBeClosed') && !data.canBeClosed

      /**
       * If we are sure that the webchat should be opened from the creation and displayed all the time
       * we add the y_active class to webChatContainer at the creation
       *
       * Otherwise yelda_assistant_img click event management will take care of showing and hiding the webchat
       * - closeChat() remove "y_active" from the yelda container
       * - openChat() add y_active" to the yelda container
       */
     if (shoulBeOpened && cantBeClosed) {
       this.webChatContainer.classList.add('y_active')
     }
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

      this.initWebChatContainerYActiveClass(data)

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
   * Handles communication between parent window and iframe, mainly for open and closing the chat
   * handles also the chat bubble style
   * @param {event} event
   */
  messageListener(event) {
    // event.message is only there to support IE11.
    const eventData = event.data || event.message
    if (!eventData) {
      return
    }

    /*
     * Simple event management parent.postMessage('string message')
     */
    if (!eventData.event) {
      switch(eventData) {
        case config.FRAME_EVENT_TYPES.RECEIVED.OPEN_CHAT:
          // 'openChat' event triggered from webchat
          this.openChat()
        break
        case config.FRAME_EVENT_TYPES.RECEIVED.CLOSE_CHAT:
          // 'closeChat' event triggered from webchat
          this.closeChat()
        break
        case config.FRAME_EVENT_TYPES.RECEIVED.ABSTAIN_LEAVE_VIEWPORT:
          // 'abstainLeaveViewport' event triggered from webchat to stop listening to the leave viewport event
          this.listenLeaveViewport(true)
        break
        case config.FRAME_EVENT_TYPES.RECEIVED.LISTEN_LEAVE_VIEWPORT:
          // Triggered from webchat to listen leave viewport event
          this.listenLeaveViewport()
        break
        case config.FRAME_EVENT_TYPES.RECEIVED.LISTEN_URL_UPDATE:
          // Triggered from webchat to listen for url update
          this.listenUrlUpdate()
        break
        case config.FRAME_EVENT_TYPES.RECEIVED.ABSTAIN_URL_UPDATE:
          // Triggered form webchat to stop listening for url update
          this.listenUrlUpdate(true)
        break
        case config.FRAME_EVENT_TYPES.RECEIVED.ADD_BUBBLE_TEXT:
          // Triggered from webchat to add assistant bubble text if possible
          if (!this.configurationData.hasOwnProperty('canBeClosed') || this.configurationData.canBeClosed) {
            this.addAssistantBubbleText()
          }
        break;
      }
      return
    }

    /*
     * Complex event management parent.postMessage({ event: 'xxxx', data: yyyy })
     */
    switch(eventData.event) {
      case config.FRAME_EVENT_TYPES.RECEIVED.OPEN_LIGHT_GALLERY:
        if (!eventData.mediaSources || !eventData.mediaSources.length) {
          return
        }

        this.handleLightGallery(eventData)
      break
      case config.FRAME_EVENT_TYPES.RECEIVED.IS_SENDING_MESSAGE:
        /**
         * Custom event to send to Yelda to keep track of the webchat ability to receive a new message
         * If isSendingMessage data is true, it means that a user message has already been sent to the webchat and
         * is still waiting for an answer
         * If isSendingMessage data is false, the webchat is ready to receive new user messages
         */
        if (eventData.hasOwnProperty('data')) {
          window.dispatchEvent(new CustomEvent('isSendingMessage', { detail: eventData.data }))
        }
      break
      case config.FRAME_EVENT_TYPES.RECEIVED.ADD_MINIMAL_NOTIFICATION_TEXT:
        if (!this.configurationData.hasOwnProperty('canBeClosed') || this.configurationData.canBeClosed) {
          this.addAssistantBubbleText(eventData.text, 'y_notification')
        }
      break;
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
    // Closing the webchat = remove the y_active class on #yelda_container
    // Hiding the iframe + showing back the bubble + animation  => All is done in CSS
    const yeldaContainerElement = document.getElementById('yelda_container')
    if (yeldaContainerElement !== null) {
      yeldaContainerElement.classList.remove('y_active')
    }
  }

  /**
   * Open the webchat window
   */
  openChat() {
    // Adding the class "activated" allows the CSS to change the transition/animation after the first opening
    const assistantImgElement = document.getElementById('yelda_assistant_img')
    if (assistantImgElement !== null) {
      assistantImgElement.classList.add('activated')
    }

    // Opening the webchat = adding the y_active class on #yelda_container
    // Showing the iframe + hiding bubble + hiding minimal notification + animation => All is done in CSS
    const yeldaContainerElement = document.getElementById('yelda_container')
    if (yeldaContainerElement !== null) {
      yeldaContainerElement.classList.add('y_active')
    }

    // Hide the assistant bubble text while opening the webchat window
    // Note :  bubble text container is also hidden in CSS
    if (this.assistantBubbleText) {
      this.assistantBubbleText = null
    }

    // Remove assistant bubble text while opening the webchat window
    this.removeElement('yelda_assistant_bubble_text')

    // Propagate the event to the webchat
    document.getElementById('web_chat_frame').contentWindow.postMessage(config.FRAME_EVENT_TYPES.SENT.OPEN_CHAT, '*')
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

    // To make removeEventListener to work do not reassign messageListenerBind
    if (!this.messageListenerBind) {
      this.messageListenerBind = this.messageListener.bind(this)
    }
    eventHandler(messageEvent, this.messageListenerBind)
  }

  /**
   * Load CSS asynchronously
   */
  loadCssAsync() {
    const head = document.getElementsByTagName('head')[0]
    const yeldaCss = document.createElement('link')
    yeldaCss.rel = 'stylesheet'
    yeldaCss.type = 'text/css'
    yeldaCss.crossorigin = 'anonymous'
    yeldaCss.href = 'https://yelda-webchat.s3.eu-west-3.amazonaws.com/css/yeldaWebchatInjector.min.css'
    yeldaCss.media = 'all'
    head.appendChild(yeldaCss)
  }

  /**
   * Generate webchatURL and create webchatIframe
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

      if (data) {
        await this.setupChat(data)
      }
      resolve()
    })
  }

 /**
   * Update data object with assistantId, assistantSlug and locale if needed
   * @param {Object} data { data.assistantUrl, data.chatPath }
   * @param {Object} webchatSettings webchat settings from DB
   * @param {Object} data
   */
  updateAssistantData(data, webchatSettings) {
    if (!data.settingId || !webchatSettings || !webchatSettings.assistantSlug) {
      return data
    }

    data.assistantId = webchatSettings.assistantId
    data.assistantSlug = webchatSettings.assistantSlug
    data.locale = webchatSettings.locale

    return data
  }

  /**
   * Return assistantUrl from param or deduced from href
   * @param {String} assistantUrl can be undefined
   * @param {String} href window.location.href
   * @return {String} assistantUrl
   */
  setAssistantUrl(assistantUrl, href) {
    if (assistantUrl) {
      return assistantUrl.replace(/\/$/, '')
    }

    const host = config.REGEX_HOST.STAGING.test(href) ? config.HOST.STAGING: config.HOST.PRODUCTION

    return `https://${host}`.replace(/\/$/, '')
  }

  /**
   * Set default value for data object used for multiple init functions
   * @param {Object} data { data.assistantUrl, data.chatPath }
   * @param {Object} data
   */
  formatData(data) {
    const chatPath = data.chatPath || '/chat'

    /*
      Formatting the url to remove trailing slash
      This avoids problems with missing or duplicating slashes when composing other urls with them
    */
    data.assistantUrl = this.setAssistantUrl(data.assistantUrl, window.location.href)
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

  /**
   * Check whether the css href is yeldaWebchatInjector.css or yeldaWebchatInjector.min.css
   * @param {String} cssHref
   * @returns {Boolean}
   */
  isYeldaCssInjector(cssHref) {
    const injectorCSSRegex = new RegExp('\\yeldaWebchatInjector(.min)?.css')
    return injectorCSSRegex.test(cssHref)
  }

  /**
   * Check whether the style sheet is already loaded
   * @returns {Boolean}
   */
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
          if(this.isYeldaCssInjector(sheet.href)) {
            isFound = true
            break sheetsLoop
          }
          continue
        }
      }
    }

    return isFound
  }

  /**
   * Get the app env from the assistant url
   * @param {String} assistantUrl
   * @returns {String} env
   */
  getAppEnv(assistantUrl) {
    if (config.REGEX_HOST.STAGING.test(assistantUrl)) {
      return config.APP_ENV_VALUES.STAGING
    }

    // By default, use the production env
    return config.APP_ENV_VALUES.PRODUCTION
  }

  /**
   * Get the chat bubble url base based on isFallback
   * @param {Object} data { assistantUrl, assistantId, settingId }
   * @param {Boolean} isFallback fallback means yelda endpoint
   * @returns {String} url base
   */
  getChatBubbleUrlBase(data, isFallback) {
    if (isFallback) {
      return `${data.assistantUrl}/assistants`
    }
    return config.CHAT_BUBBLE_EXTERNAL_ENDPOINT
  }

  /**
   * return getAssistantSettings endpoint URL from data
   * @param {Object} data { assistantUrl, assistantId, settingId }
   * @param {Boolean} isFallback
   * @return {String} url
   */
  getAssistantSettingsUrl(data, isFallback) {
    const urlBase = this.getChatBubbleUrlBase(data, isFallback)
    // The app env is required as query for the external chatbubble endpoint
    // If the env was not explicitly set in data, guess it from the assistant url
    const appEnv = data.env || this.getAppEnv(data.assistantUrl)
    const envQuery = `env=${appEnv}`
    if(data.settingId) {
      return  `${urlBase}/settings/${data.settingId}/chatBubble?${envQuery}`
    }

    return  `${urlBase}/${data.assistantId}/chatBubble/${data.locale}?${envQuery}`
  }

  /**
   * Update assistantImage with assistant settings from backend if any
   * @param {Object} data { assistantUrl, assistantId, settingId }
   * @param {Object} options
   * @param {Object} options.isFallback
   * @param {Number} options.customTimeout in milliseconds
   * @return {Promise}
   */
  getAssistantSettings(data, { isFallback = false, customTimeout = null } = {}) {
    return new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest()

        // Get the url base depending on if we are doing the basic request (external chatbubble endpoint)
        // or the fallback one (chatbubble endpoint in Yelda)
        const url = this.getAssistantSettingsUrl(data, isFallback)

        xhr.open('GET', url)
        if (customTimeout) {
          xhr.timeout = customTimeout
        }
        xhr.send()

        // Bind and call are necessary to pass the "this" to the callback function
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            const responseText = xhr.responseText ? JSON.parse(xhr.responseText) : null
            // Yelda endpoint returns { data: ...webchatSettings } (to be compatible with old versions of the chat-plugin)
            // whereas the external endpoint returns { ...webchatSettings }
            // We need to handle both format
            const webchatSettings = responseText && (responseText.data || responseText)

            if (webchatSettings) {
              return resolve(webchatSettings)
            }

            // We did not received the expected webchatSettings
            // If we are already in fallback mode, it means there is no webchat settings for the given init information
            if (isFallback) {
              return resolve(null)
            }

            // If the initial request do not return webchatSettings, it might be because they were not set in Redis yet
            // So let's call the yelda endpoint (fallback) that will find the setting (if it exists) and set it in Redis
            return resolve(this.getAssistantSettings(data, { isFallback: true }))
          }
        }

        xhr.ontimeout = () => {
          /*
            It the initial request to the external chatbubble endpoint timed out, (maybe the endpoint is down)
            let's fallback on the yelda endpoint
          */
          if (!isFallback) {
            // Set isFallback to true to be sure to not end up in an infinite loop
            return resolve(this.getAssistantSettings(data, { isFallback: true }))
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

      if (data.settingId === undefined && (data.assistantId === undefined || data.assistantSlug === undefined)) {
        return resolve()
      }


      // These data will be needed to avoid loading outdated data in the chat (in case of multiple chat load requests)
      this.assistantId = data.assistantId
      this.locale = data.locale
      this.settingId = data.settingId

      // Get assistant settings from backend
      try {
        this.webchatSettings = await this.getAssistantSettings(data, { customTimeout: config.CHAT_BUBBLE_REQUEST_TIMEOUT })
        // Webchat can be loaded thanks to a single settingId or group of data : {assistantId, assistantSlug, locale}
        // If only settingId is provided, then we will fill {assistantId, assistantSlug, locale} thanks to the assistant settings
        data = this.updateAssistantData(data, this.webchatSettings)

      } catch (err) {
        this.webchatSettings = null
      }

      // Remove event listeners when switching bots
      this.listenLeaveViewport(true)
      this.listenUrlUpdate(true)

      this.loadChat(data)

      this.configurationData = data
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

    // if webchatSettings is null, it means that the admins didn't created custom webchat settings or
    // or that the API call to get the settings failed
    // In this case we can still load the webchat with the default settings
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
   * Return if the webchat loadChat settings are different from the yeldaChat global assistant settings
   *
   * - yeldaChat can be init (and reset) either with the settingId parameter or the pair (assistantId, locale) that we store globally
   * - Each new webchat loading request implies a "getAssistantSettings" async API call,
   * => If multiple new webchat loading requests are done in a short amount of time,
   * "getAssistantSettings" response can be subject to a race condition issue:
   * The latest requested answer received might not be the latest API call answer.
   *
   * isDataOutdated checks if one of the global parameter is different the ones from the webchat settings we got from the "getAssistantSettings" API call
   * so the "loadChat" function can be informed that the latest request is not the one currently handled
   * And can stop the current process to let the chat load with the global latest requested settings
   *
   * @param {Object} webchatSettings - current settings from the reset or init yeldaChat request
   * @param {String} webchatSettings.settingId
   * @param {String} webchatSettings.assistantId
   * @param {String} webchatSettings.locale
   * @param {Object} globalData - latest globally stored settings from the reset or init yeldaChat request
   * @param {String} globalData.settingId
   * @param {String} globalData.assistantId
   * @param {String} globalData.locale
   * @returns {Boolean}
   */
  isDataOutdated(data, { settingId, assistantId, locale }) {
    if (data.settingId && data.settingId !== settingId) {
      return true
    }
    if (!data.settingId && (data.assistantId !== assistantId || data.locale !== locale)) {
      return true
    }
    return false
  }

  /**
   * Load the chat after getting the webchat settings if publication is enabled
   * @param {Object} data { data.assistantUrl, data.assistantId, data.locale }
   */
  loadChat(data) {
    if (this.isDataOutdated(data, this)) {
      return
    }
    if (!this.shouldChatBeLoaded(this.webchatSettings, data)) {
      this.unLoadChat()
      return
    }

    // Load Async css only if style sheet not found
    if (!this.isStyleSheetLoaded()) {
      this.loadCssAsync()
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
        this.assistantImage.removeEventListener('click', this.openChat.bind(this))
        this.assistantImage.replaceWith(this.bubbleContainerClone)
      } else {
        this.removeElement('yelda_assistant_img')
      }
    }

    if (this.assistantBubbleText) {
      this.removeElement('yelda_assistant_bubble_text')
    }

    if (this.iframeContainer) {
      this.removeElement('yelda_iframe_container')
    }

    if (this.webChatContainer) {
      this.removeElement('yelda_container')
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
   * Remove element from dom
   * @param {String} id
   */
  removeElement(id) {
    if (document.getElementById(id)) {
      document.getElementById(id).remove()
    }
  }

  init(data) {
    return new Promise(async resolve => {
      if (data.settingId === undefined && (data.assistantId === undefined || data.assistantSlug === undefined)) {
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
      webchatFrame.contentWindow.postMessage({ event: config.FRAME_EVENT_TYPES.SENT.SEND_USER_MESSAGE, data: message })
    }
  }

  /**
   * Listen to url update on the page
   * @param {Boolean} shouldRemoveEvent
   */
  listenUrlUpdate(shouldRemoveEvent = false) {
    if (shouldRemoveEvent && this.urlObserver) {
      this.urlObserver.disconnect()
      this.urlObserver = null
      return
    }

    try {
      this.previousUrl = ''
      this.urlObserver = new MutationObserver(() => {
        if (location.href === this.previousUrl) {
          return
        }
        this.previousUrl = location.href
        this.urlUpdateListener()
      })

      this.urlObserver.observe(document, {childList: true, subtree: true})
    } catch(err) {
      console.warn('listenUrlUpdate error', err)
    }
  }

  /**
   * Callback for url update listener
   */
  urlUpdateListener() {
    const webchatFrame = document.getElementById('web_chat_frame')

    if (!webchatFrame) {
      return
    }
    webchatFrame.contentWindow.postMessage({ event: config.FRAME_EVENT_TYPES.SENT.URL_UPDATE, data: window.location.href }, '*')
  }

  /**
   * Listen leave viewport event handling
   * @param {Boolean} shouldRemoveEvent - default false
   */
  listenLeaveViewport(shouldRemoveEvent = false) {
    const md = new MobileDetect(navigator.userAgent)
    const isMobile = md.mobile() !== null

    /**
     * Not needed to listen on mobile since webchat covers the full page of the site
     * and we can't able to detect mouseout events
     */
    if (isMobile) {
      return
    }

    const eventHandler = window[shouldRemoveEvent ? 'removeEventListener' : 'addEventListener']

    if (!this.viewportListenerBind) {
      this.viewportListenerBind = this.viewportListener.bind(this)
    }
    // mouseout event is used to listen leave viewport
    eventHandler('mouseout', this.viewportListenerBind)
  }

  /**
   * Callback for leave viewport listener
   * @param {Event} event
   */
  viewportListener(event) {
    /**
     * when mouse moves between dom elements mouseout event is trigged but we need to trigger
     * the event when mouse moves out of the viewport so toElement and relatedTarget is checked
     */
    if (event.toElement || event.relatedTarget) {
      return
    }

    // When mouse leaves the viewport send 'leaveViewPort' to webchat
    document.getElementById('web_chat_frame').contentWindow.postMessage({
      event: config.FRAME_EVENT_TYPES.SENT.LEAVE_VIEWPORT
    }, '*')
  }
}

let yeldaChat = new YeldaChat()

if (typeof window !== 'undefined') {
  window.yeldaChat = yeldaChat
}

export default yeldaChat
