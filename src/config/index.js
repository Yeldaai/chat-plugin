// eslint-disable-next-line no-undef
module.exports = {
  CAN_BE_CLOSED_WITH_PARENT_ID: false,
  YELDA_PARAMETER: 'yparam',
  DEFAULT_PUBLICATION_STATUS: true,
  ALWAYS_ALLOWED_SITES_REGEX : /^([a-z-]*.yelda.ai|localhost|0.0.0.0|127.0.0.1)$/,
  REGEX_HOST: {
    STAGING: /staging.yelda.ai/
  },
  HOST: {
    PRODUCTION: 'app.yelda.ai',
    STAGING: 'staging.yelda.ai',
  },
  FRAME_EVENT_TYPES: {
    SENT: {
      OPEN_CHAT: 'openChat',
      LEAVE_VIEWPORT: 'leaveViewPort',
      SEND_USER_MESSAGE: 'sendUserMessage',
      URL_UPDATE: 'urlUpdate'
    },
    RECEIVED: {
      OPEN_CHAT: 'openChat',
      CLOSE_CHAT: 'closeChat',
      ABSTAIN_LEAVE_VIEWPORT: 'abstainLeaveViewport',
      OPEN_LIGHT_GALLERY: 'openLightGallery',
      IS_SENDING_MESSAGE: 'isSendingMessage',
      LISTEN_LEAVE_VIEWPORT: 'listenLeaveViewport',
      LISTEN_URL_UPDATE: 'listenUrlUpdate',
      ABSTAIN_URL_UPDATE: 'abstainUrlUpdate',
      ADD_BUBBLE_TEXT: 'addBubbleText',
      ADD_MINIMAL_NOTIFICATION_TEXT: 'addMinimalNotificationText'
    }
  },
  CHAT_BUBBLE_EXTERNAL_ENDPOINT: 'https://webchat.yelda.ai/webchat',
  CHAT_BUBBLE_REQUEST_TIMEOUT: 5000,
  APP_ENV_VALUES: {
    STAGING: 'staging',
    PRODUCTION: 'production'
  }
}
