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
    OPEN_CHAT: 'openChat',
    CLOSE_CHAT: 'closeChat',
    LISTEN_LEAVE_VIEWPORT: 'listenLeaveViewport',
    ABSTAIN_LEAVE_VIEWPORT: 'abstainLeaveViewport',
    LEAVE_VIEWPORT: 'leaveViewPort',
    OPEN_LIGHT_GALLERY: 'openLightGallery',
    IS_SENDING_MESSAGE: 'isSendingMessage',
    SEND_USER_MESSAGE: 'sendUserMessage'
  }
}
