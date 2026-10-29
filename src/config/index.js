// eslint-disable-next-line no-undef
module.exports = {
  CAN_BE_CLOSED_WITH_PARENT_ID: false,
  YELDA_PARAMETER: 'yparam',
  DEFAULT_PUBLICATION_STATUS: true,
  ALWAYS_ALLOWED_SITES_REGEX : /^([a-z-]*.yelda.ai|localhost|0.0.0.0|127.0.0.1)$/,
  REGEX_HOST: {
    STAGING: /staging.yelda.ai/,
    YELDA: /.yelda.ai/
  },
  HOST: {
    PRODUCTION: 'app.yelda.ai',
    STAGING: 'staging.yelda.ai'
  },
  FRAME_EVENT_TYPES: {
    SENT: {
      OPEN_CHAT: 'openChat',
      LEAVE_VIEWPORT: 'leaveViewPort',
      SEND_USER_MESSAGE: 'sendUserMessage',
      UPDATE_SLOT: 'updateSlot',
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
      ADD_MINIMAL_NOTIFICATION_TEXT: 'addMinimalNotificationText',
      EXEC_JS_FUNC: 'execJsFunc'
    }
  },
  CHAT_BUBBLE_EXTERNAL_ENDPOINT: 'https://webchat.yelda.ai/webchat',
  CHAT_BUBBLE_REQUEST_TIMEOUT: 5000,
  APP_ENV_VALUES: {
    STAGING: 'staging',
    PRODUCTION: 'production'
  },
  DEFAULT_LOCALE: 'fr_FR',
  // Keys that activate the chat launcher, like a native button
  ACTIVATION_KEYS: ['Enter', ' '],
  // Names read by screen readers for the elements added to the host page
  ACCESSIBILITY_LABELS: {
    en_US: { OPEN_CHAT: 'Open the chat', CLOSE_BUBBLE_TEXT: 'Close the message', CHAT_FRAME_TITLE: 'Virtual assistant chat' },
    en_GB: { OPEN_CHAT: 'Open the chat', CLOSE_BUBBLE_TEXT: 'Close the message', CHAT_FRAME_TITLE: 'Virtual assistant chat' },
    fr_FR: { OPEN_CHAT: 'Ouvrir le chat', CLOSE_BUBBLE_TEXT: 'Fermer le message', CHAT_FRAME_TITLE: 'Chat avec l\'assistant virtuel' },
    fr_CA: { OPEN_CHAT: 'Ouvrir le clavardage', CLOSE_BUBBLE_TEXT: 'Fermer le message', CHAT_FRAME_TITLE: 'Clavardage avec l\'assistant virtuel' },
    es_ES: { OPEN_CHAT: 'Abrir el chat', CLOSE_BUBBLE_TEXT: 'Cerrar el mensaje', CHAT_FRAME_TITLE: 'Chat con el asistente virtual' },
    pt_PT: { OPEN_CHAT: 'Abrir o chat', CLOSE_BUBBLE_TEXT: 'Fechar a mensagem', CHAT_FRAME_TITLE: 'Chat com o assistente virtual' },
    de_DE: { OPEN_CHAT: 'Chat öffnen', CLOSE_BUBBLE_TEXT: 'Nachricht schließen', CHAT_FRAME_TITLE: 'Chat mit dem virtuellen Assistenten' },
    it_IT: { OPEN_CHAT: 'Apri la chat', CLOSE_BUBBLE_TEXT: 'Chiudi il messaggio', CHAT_FRAME_TITLE: 'Chat con l\'assistente virtuale' },
    nl_NL: { OPEN_CHAT: 'Chat openen', CLOSE_BUBBLE_TEXT: 'Bericht sluiten', CHAT_FRAME_TITLE: 'Chat met de virtuele assistent' },
    zh_CN: { OPEN_CHAT: '打开聊天', CLOSE_BUBBLE_TEXT: '关闭消息', CHAT_FRAME_TITLE: '与虚拟助手聊天' },
    zh_HK: { OPEN_CHAT: '打開聊天', CLOSE_BUBBLE_TEXT: '關閉訊息', CHAT_FRAME_TITLE: '與虛擬助手聊天' },
    zh_TW: { OPEN_CHAT: '打開聊天', CLOSE_BUBBLE_TEXT: '關閉訊息', CHAT_FRAME_TITLE: '與虛擬助手聊天' },
    ar_AE: { OPEN_CHAT: 'فتح المحادثة', CLOSE_BUBBLE_TEXT: 'إغلاق الرسالة', CHAT_FRAME_TITLE: 'محادثة مع المساعد الافتراضي' }
  }
}
