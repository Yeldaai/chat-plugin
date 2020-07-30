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
   * @param {Object} data { data.assistantUrl, data.assistantId }
  */
  createContainer (data) {
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

    // Add assistant image if the webchat can be closed
    // Otherwise we will be able to close the webchat but not open it again
    // because the assistant image containing the openChat event wouldn't have been created
    if (!data.hasOwnProperty('canBeClosed') || data.canBeClosed) {
      this.addAssistantImage(data)
    }
  }

  /**
  * Create assistantImage element and add it to webChatContainer element
   * @param {Object} data { data.assistantUrl, data.assistantId }
  */
  addAssistantImage (data) {
    if (!this.webChatContainer) {
      this.webChatContainer = document.getElementById('yelda_container')
    }

    // If it's already set up, keep it
    if (document.getElementById('yelda_assistant_img') !== null) {
      return
    }

    // Assistant Image Creation
    this.assistantImage = document.createElement('div')

    // If the webchat should be opened directly, don't display the assistant image
    // This avoids the assistant image to be displayed below the opened webchat instead of being hidden and only appear once the webchat is closed
    if (data.shouldBeOpened) {
      this.assistantImage.style.display = 'none'
    }

    this.assistantImage.setAttribute('id', 'yelda_assistant_img')
    this.assistantImage.setAttribute('class', 'yelda_assistant_img default')
    this.assistantImage.innerHTML = '<i class="fas fa-comment"></i>'

    // Add click event to assistant image
    this.assistantImage.addEventListener('click', this.openChat)

    // Get assistant settings from backend
    // & add assistantImage to webChatContainer in xhr onreadystatechange callback
    this.getAssistantSettings(data, this.updateAssistantImageWithAssistantSettings)
  }

  /**
   * Update assistantImage with assistant settings from backend if any
   * @param {Object} data { data.assistantUrl, data.assistantId }
   * @param {Object} callback callback function called on onreadystatechange
  */
  getAssistantSettings(data, callback) {
    const xhr = new XMLHttpRequest();
    const url= `${data.assistantUrl}/assistants/${data.assistantId}/chatBubble`
    xhr.open("GET", url);
    xhr.send();

    // Bind and call are necessary to pass the "this" to the callback function
    xhr.onreadystatechange = (function () {
      if(xhr.readyState === 4) {
        callback.call(this, xhr.responseText)
      }
    }).bind(this)
  }

  /**
   * Update assistantImage with assistant settings from backend if any
   * @param {Object} responseText xhr response
  */
  updateAssistantImageWithAssistantSettings(responseText) {
    if(!this.webChatContainer) {
      return
    }

    if (!responseText) {
      this.webChatContainer.appendChild(this.assistantImage)
      return
    }

    try {
      const settings = JSON.parse(responseText)

      if (!settings || !settings.data ) {
        this.webChatContainer.appendChild(this.assistantImage)
        return
      }

      const customImage =  settings.data.image && settings.data.image.url
      const hasCustomStyle = settings.data.hasOwnProperty('isDefaultStyle') && !settings.data.isDefaultStyle

      if (!hasCustomStyle || !customImage) {
        this.webChatContainer.appendChild(this.assistantImage)
        return
      }

      // If the device is mobile and mobile image url exists then use it
      const md = new MobileDetect(navigator.userAgent)
      const image = md.mobile() !== null && settings.data.mobileImage && settings.data.mobileImage.url
        ? settings.data.mobileImage.url
        : customImage

      this.assistantImage.classList.remove('default', 'custom')
      this.assistantImage.innerHTML = `<img src="${image}" alt="assistant">`
      this.assistantImage.classList.add('custom')

      this.webChatContainer.appendChild(this.assistantImage)
    } catch (e) {
      this.webChatContainer.appendChild(this.assistantImage)
      return
    }
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
      url = this.updateQueryStringParameter(url, 'isStartBtn', (data.isAdmin && data.isStartBtn))
    }

    return url
  }

  /**
   * Create iframeContainer and it's child webchat iframe, and it to webChatContainer
   * @param {String} url webchat url
   * @param {Boolean} shouldBeOpened
   * @return {Element} iframe HTML element
  */

  createWebChatFrame (url, shouldBeOpened) {
    if (!this.webChatContainer) {
      this.webChatContainer = document.getElementsByClassName('yelda_container')[0]
    }

    // Iframe creation
    // Parent div to contain the iframe. To allow css animation on iframe
    if (!this.iframeContainer) {
      let classList = 'yelda_iframe_container'

      this.iframeContainer = document.createElement('div')
      this.iframeContainer.setAttribute('id', 'yelda_iframe_container')

      // Display iframe if webchat should be opened on load, otherwise hide it
      if (shouldBeOpened) {
        // CSS class which contols the opacity and position of the frame container
        classList += ' y_active inner'
      } else {
        // If the iframe is inserted into the document body, hide it by default
        // If the webChatContainer is inserted into the document body, the iframeContainer should be hidden it by default
        // yelda_assistant_img click event management will take care of showing and hiding the webchat
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
      ...this.getSharedUrlProperties(mediaSource)  // { facebookShareUrl, twitterShareUrl, pinterestShareUrl }
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
    const videoSources =  mediaSource.urls.reduce((acc, url) => {
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
  messageListener (event) {
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
        window.dispatchEvent(new CustomEvent('isSendingMessage', { detail: event.data.data }) )
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
      } else if(mediaSource.urls && mediaSource.urls.length) {
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
      googlePlus: false, //Don't show the googlePlus share button
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
      assistantImgElement.style.display = 'block'
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
  openChat () {
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
  toggleFrameListener (remove = false) {
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

  loadCssAsync (origin) {
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
   * @param {Object} data { data.chatUrl, data.assistantId, data.assistantSlug, data.shouldBeOpened }
  */
  setUpChatIFrame (data) {
    const webchatUrl = this.createWebChatURL(data)
    this.webChatIframe = this.createWebChatFrame(webchatUrl, data.shouldBeOpened)
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

    if(data.hasOwnProperty('shouldBeOpened')) {
      data.shouldBeOpened = data.shouldBeOpened ? true : false
    }

    if(data.hasOwnProperty('canBeClosed')) {
      data.canBeClosed = data.canBeClosed ? true : false
    }

    // default container
    this.parentContainer = document.body

    // If parentContainerId presents and valid one, set parentContainer
    if(data.parentContainerId && document.getElementById(data.parentContainerId)) {
      this.parentContainer = document.getElementById(data.parentContainerId)
      // Don't overwrite canBeClosed if it has been explicitly set in the webchat config
      // However, if canBeClosed is not provided but the parentContainerId is provided, force it to false
      data.canBeClosed = data.hasOwnProperty('canBeClosed') ? data.canBeClosed : config.CAN_BE_CLOSED_WITH_PARENT_ID
    }

    return data
  }

  isStyleSheetLoaded () {
    const sheets = document.styleSheets
    let isFound = false
    const cssSelector = '.yelda_assistant_img' // Used to check style sheet loaded or not

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

    if (!document.body || !this.parentContainer) {
      console.warn('document.body is not ready, please use yelda.init instead of yelda.setupChat or move the code in the page body')
      return null
    }

    // Create container for iframe
    this.createContainer(data)

    // create the iframe and insert into iframe container
    this.setUpChatIFrame(data)

    // add the frame lister to receive message from iframe to the parent
    this.toggleFrameListener()
  }

  /**
   * destroy the webchat window
   */
  unLoadChat () {
    this.toggleFrameListener(true)

    /**
     * If init or setupChat has been called multiple times we might end up with multiple yelda_iframe_container and yelda_container
     * So to be sure that the destroy the webchat window completely, let's find all the matching elements and remove them all
     */
    if (this.iframeContainer) {
      for (const element of document.querySelectorAll("[id='yelda_iframe_container']")) {
        element.remove()
      }
    }

    if (this.assistantImage) {
      for (const element of document.querySelectorAll("[id='yelda_assistant_img']")) {
        element.remove()
      }
    }

    if (this.webChatContainer) {
      for (const element of document.querySelectorAll("[id='yelda_container']")) {
        element.remove()
      }
    }

    this.assistantImage = null
    this.iframeContainer = null
    this.webChatIframe = null
    this.webChatContainer = null
    this.parentContainer = null
  }

  init(data) {
    if (data.assistantId === undefined || data.assistantSlug === undefined) {
      return null
    }

    // if the DOM is already ready, call setupChat
    if (document.readyState === 'complete') {
      this.setupChat(data)
      return
    }

    // If the DOM is not yet ready, wait
    window.onload = () => {
      this.setupChat(data)
    }
  }

  /**
   * Send a user message to the webchat
   */
  sendMessageToChat(message) {
    const webchatFrame = document.getElementById('web_chat_frame')
    if (webchatFrame) {
      webchatFrame.contentWindow.postMessage({ event: 'sendUserMessage', data: message })
    }
  }
}

let yeldaChat = new YeldaChat()

if (typeof window != 'undefined') {
  window.yeldaChat = yeldaChat
}

export default yeldaChat
