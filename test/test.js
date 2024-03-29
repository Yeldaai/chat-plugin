/* eslint-disable no-undef */
'use strict'

/**
 * Unit Test cases covered
 * 1. yeldaChat should be a object and yeldaChat.init should be a typeof function
 * 2. check the init function with invalid data or missing data
 * 3. test createContainer function should create webChatContainer element
 * 4. test addAssistantImage function should create assistantImage element
 * 5. test createWebChatURL function should return valid iframe url
 * 6. test createWebChatFrame function should create iframeContainer
 */

import { expect, should, use, assert } from 'chai'
import mock from 'xhr-mock'

// mock.setup() sets global.XMLHttpRequest with mock xhr
mock.setup()
const testAPIUrls = [
  // Old yelda chatBubble endpoint on assistant Id for multiple locale
  'https://app.yelda.ai/assistants/12345678/chatBubble/fr_FR?env=production',
  'https://app.yelda.ai/assistants/12345678/chatBubble/en_US?env=production',
  // Old yelda chatBubble endpoint on setting Id
  'https://app.yelda.ai/assistants/settings/600060987bcdfb0fe914808b/chatBubble?env=production',
  'https://app.yelda.ai/assistants/settings/600060987bcdfb0fe914808b/chatBubble?env=staging',
  // new webchat endpoint on settingId
  // used by     it('should return object if settings for webchat are correct', async () => {
  'https://webchat.yelda.ai/webchat/settings/600060987bcdfb0fe914808c/chatBubble?env=production'
]

testAPIUrls.forEach(url => {
  mock.get(url, {
    status: 201,
    body: JSON.stringify({ data: {} })
  })
})

// To Fix undefined error on navigator while running the test
global.navigator = {
  userAgent: 'node.js'
}

// To Fix undefined error on MutationObserver while running the test
global.MutationObserver = class {
  // eslint-disable-next-line no-unused-vars
  constructor(callback) {}
  disconnect() {}
  // eslint-disable-next-line no-unused-vars
  observe(element, initObject) {}
};

should()
use(require('chai-dom'))

const jsdom = require('jsdom')
const { JSDOM } = jsdom

const validMockData = {
  'assistantSlug': 'testClient',
  'assistantId': '12345678',
  'chatPath': 'chat'
}

describe('YeldaChat', () => {
  const { window } = new JSDOM(`...`, { url: 'https://yelda.ai' })

  global.window = window
  global.document = window.document
  document.body.innerHTML = document.body.innerHTML + '<div><span id="bubble"></span></div>'

  const yeldaChat = require('../dist/js/yeldaWebchatInjector.min')

  // yeldaChat should be a object and yeldaChat.init should be a typeof function
  it('should return typeof object', (done) => {
    assert.typeOf(yeldaChat, 'object', 'we have an object')
    done()
  })

  describe('yeldaChat.setAssistantUrl', () => {
    it('should return typeof function', () => {
      assert.typeOf(yeldaChat.setAssistantUrl, 'function', 'setAssistantUrl function exists')
    })

    it('should return assistantUrl if provided', () => {
      var url = 'https://staging.yelda.ai/a7932/yelda/assistantSettings/passthrough'
      expect(yeldaChat.setAssistantUrl(url)).to.deep.equal(url)
      expect(yeldaChat.setAssistantUrl(url, url)).to.deep.equal(url)
    })

    it('should return https://staging.yelda.ai for https://staging.yelda.ai... href if assistantUrl is null', () => {
      var url = 'https://staging.yelda.ai/a7932/yelda/assistantSettings/passthrough'
      expect(yeldaChat.setAssistantUrl(null, url)).to.deep.equal('https://staging.yelda.ai')
    })

    it('should return https://app.yelda.ai for http://localhost:8080... href if assistantUrl is null', () => {
      var url = 'http://localhost:8080/a7932/yelda/assistantSettings/passthrough'
      expect(yeldaChat.setAssistantUrl(null, url)).to.deep.equal('https://app.yelda.ai')
    })

    it('should return http://localhost:8080 for http://localhost:8080... href if assistantUrl is http://localhost:8080', () => {
      var url = 'http://localhost:8080/a7932/yelda/assistantSettings/passthrough'
      expect(yeldaChat.setAssistantUrl('http://localhost:8080', url)).to.deep.equal('http://localhost:8080')
    })

    it('should return https://app.yelda.ai for file://... href if assistantUrl is null', () => {
      var url = 'file:///var/www/yelda/chat-plugin/test/index.html'
      expect(yeldaChat.setAssistantUrl(null, url)).to.deep.equal('https://app.yelda.ai')
    })

    it('should return http://localhost:8080 for file://... href if assistantUrl is http://localhost:8080', () => {
      var url = 'file:///var/www/yelda/chat-plugin/test/index.html'
      expect(yeldaChat.setAssistantUrl('http://localhost:8080', url)).to.deep.equal('http://localhost:8080')
    })

    it('should return https://staging.yelda.ai for any other href if assistantUrl is null', () => {
      var url = 'https://app.yelda.ai/a7932/yelda/assistantSettings/passthrough'
      expect(yeldaChat.setAssistantUrl(null, url)).to.deep.equal('https://app.yelda.ai')
      url = 'https:/viving.fr/brest/'
      expect(yeldaChat.setAssistantUrl(null, url)).to.deep.equal('https://app.yelda.ai')
    })

    it('should return https://app.yelda.ai if href and assistantUrl are null or undefined', () => {
      expect(yeldaChat.setAssistantUrl(null)).to.deep.equal('https://app.yelda.ai')
      expect(yeldaChat.setAssistantUrl(undefined)).to.deep.equal('https://app.yelda.ai')
      expect(yeldaChat.setAssistantUrl(undefined, undefined)).to.deep.equal('https://app.yelda.ai')
      expect(yeldaChat.setAssistantUrl(null, null)).to.deep.equal('https://app.yelda.ai')
    })
  })

  describe('yeldaChat.getAppEnv', () => {
    it('should return typeof function', () => {
      assert.typeOf(yeldaChat.getAppEnv, 'function', 'getAppEnv function exists')
    })

    it('should return \'production\' if no assistantUrl provided', () => {
      expect(yeldaChat.getAppEnv()).to.deep.equal('production')
    })

    it('should return \'production\' if assistantUrl is http://localhost:8080', () => {
      expect(yeldaChat.getAppEnv('http://localhost:8080')).to.deep.equal('production')
    })

    it('should return \'production\' if assistantUrl is https://app.yelda.ai/a7932/yelda', () => {
      expect(yeldaChat.getAppEnv('https://app.yelda.ai/a7932/yelda')).to.deep.equal('production')
    })

    it('should return \'staging\' if assistantUrl is https://staging.yelda.ai/a7932/yelda', () => {
      expect(yeldaChat.getAppEnv('https://staging.yelda.ai/a7932/yelda')).to.deep.equal('staging')
    })

  })
  describe('yeldaChat.getChatBubbleUrlBase', () => {
    it('should return typeof function', () => {
      assert.typeOf(yeldaChat.getChatBubbleUrlBase, 'function', 'getChatBubbleUrlBase function exists')
    })

    const mockData = {
      assistantUrl: 'https://staging.yelda.ai'
    }
    it('should return https://webchat.yelda.ai/webchat if isFallback is false', () => {
      expect(yeldaChat.getChatBubbleUrlBase(mockData, false)).to.deep.equal('https://webchat.yelda.ai/webchat')
    })

    it('should return https://staging.yelda.ai/assistants if isFallback is true', () => {
      expect(yeldaChat.getChatBubbleUrlBase(mockData, true)).to.deep.equal('https://staging.yelda.ai/assistants')
    })
  })

  describe('yeldaChat.getAssistantSettingsUrl', () => {
    it('should return typeof function', () => {
      assert.typeOf(yeldaChat.getAssistantSettingsUrl, 'function', 'getAssistantSettingsUrl function exists')
    })

    const prodMockData = Object.assign({ locale: "fr_FR", assistantUrl: 'https://app.yelda.ai' }, validMockData)
    it('should return https://webchat.yelda.ai/webchat/12345678/chatBubble/fr_FR?env=production if isFallback is false', () => {
      expect(yeldaChat.getAssistantSettingsUrl(prodMockData)).to.deep.equal('https://webchat.yelda.ai/webchat/12345678/chatBubble/fr_FR?env=production')
    })

    it('should return https://app.yelda.ai/assistants/12345678/chatBubble/fr_FR?env=production if isFallback is true', () => {
      expect(yeldaChat.getAssistantSettingsUrl(prodMockData, { isFallback: true })).to.deep.equal('https://app.yelda.ai/assistants/12345678/chatBubble/fr_FR?env=production')
    })

    const stagingMockData = Object.assign({ locale: "fr_FR", assistantUrl: 'https://staging.yelda.ai' }, validMockData)
    it('should return https://webchat.yelda.ai/webchat/12345678/chatBubble/fr_FR?env=staging if isFallback is false', () => {
      expect(yeldaChat.getAssistantSettingsUrl(stagingMockData)).to.deep.equal('https://webchat.yelda.ai/webchat/12345678/chatBubble/fr_FR?env=staging')
    })

    it('should return https://staging.yelda.ai/assistants/12345678/chatBubble/fr_FR?env=staging if isFallback is true', () => {
      expect(yeldaChat.getAssistantSettingsUrl(stagingMockData, { isFallback: true })).to.deep.equal('https://staging.yelda.ai/assistants/12345678/chatBubble/fr_FR?env=staging')
    })

    const settingIdEnMockData = Object.assign({ locale: "en_US", assistantUrl: 'https://staging.yelda.ai', settingId:'600060987bcdfb0fe914808b' }, validMockData)
    it('should return https://webchat.yelda.ai/webchat/settings/600060987bcdfb0fe914808b/chatBubble?env=staging if isFallback is false', () => {
      expect(yeldaChat.getAssistantSettingsUrl(settingIdEnMockData)).to.deep.equal('https://webchat.yelda.ai/webchat/settings/600060987bcdfb0fe914808b/chatBubble?env=staging')
    })

    it('should return https://staging.yelda.ai/assistants/settings/600060987bcdfb0fe914808b/chatBubble?env=staging if isFallback is true', () => {
      expect(yeldaChat.getAssistantSettingsUrl(settingIdEnMockData, { isFallback: true })).to.deep.equal('https://staging.yelda.ai/assistants/settings/600060987bcdfb0fe914808b/chatBubble?env=staging')
    })
  })

  describe('yeldaChat.getAssistantSettings', () => {
    it('should return typeof function', () => {
      assert.typeOf(yeldaChat.getAssistantSettings, 'function', 'getAssistantSettings function exists')
    })

    const prodMockData = Object.assign({ locale: "fr_FR", assistantUrl: 'https://app.yelda.ai' }, validMockData)

    it('should return object if settings are correct', async () => {
        const settings = await yeldaChat.getAssistantSettings(prodMockData)
        assert.typeOf(settings, 'object', 'we have an object')
    })

    // assistantId: 12 does not exists in mock options
    const incorrectMockData = { locale: "fr_FR", assistantUrl: 'https://app.yelda.ai', assistantId: 12 }

    it('should return object if settings are correct', async () => {
      const settings = await yeldaChat.getAssistantSettings(incorrectMockData)
      expect(settings).to.be.null
    })

      // 600060987bcdfb0fe914808c is set for webchat, but not app.yelda.ai
      const webchatMockData = Object.assign({ assistantUrl: 'https://app.yelda.ai',  settingId: '600060987bcdfb0fe914808c' }, validMockData)

    it('should return object if settings for webchat are correct', async () => {
      const settings = await yeldaChat.getAssistantSettings(webchatMockData)
      assert.typeOf(settings, 'object', 'we have an object')
    })

    it('should return null if settings for yelda are incorrect and isFallback is true', async () => {
      const settings = await yeldaChat.getAssistantSettings(webchatMockData, { isFallback: true})
      expect(settings).to.be.null
    })
  })

  describe('yeldaChat.updateAssistantData', () => {
    var webchatSettings = {
      assistantId : '1',
      assistantSlug: 'slug',
      locale: 'fr_FR',
      iframeURL: 'https://demo.yelda.ai/chat'
    }

    it('should return typeof function', () => {
      assert.typeOf(yeldaChat.updateAssistantData, 'function', 'updateAssistantData function exists')
    })

    it('should return data if no webchatSettings', () => {
      var data = {truc: 'truc'}
      expect(yeldaChat.updateAssistantData(data)).to.deep.equal(data)
    })

    it('should return data if no data.settingId', () => {
      var data = {truc: 'truc'}
      expect(yeldaChat.updateAssistantData(data, webchatSettings)).to.deep.equal(data)
    })

    it('should return data with webchatSettings assistantId, assistantSlug, locale if data.settingId', () => {
      var data = {truc: 'truc', settingId: 'x', iframeURL: 'https://app.yelda.ai/chat'}
      var res = {
        truc: 'truc',
        settingId: 'x',
        assistantId : '1',
        assistantSlug: 'slug',
        locale: 'fr_FR',
        iframeURL: 'https://app.yelda.ai/chat'
      }
      var href = 'https://app.yelda.ai/chat'

      expect(yeldaChat.updateAssistantData(data, webchatSettings, href)).to.deep.equal(res)
    })

    it('should use webchatSettings.iframeURL on non yelda domain ', () => {
      var data = {truc: 'truc', settingId: 'x', iframeURL: 'https://app.yelda.ai/chat'}
      var res = {
        truc: 'truc',
        settingId: 'x',
        assistantId : '1',
        assistantSlug: 'slug',
        locale: 'fr_FR',
        iframeURL: 'https://demo.yelda.ai/chat'
      }
      var href = 'https://github.com/Yeldaai/yelda/pulls'
      expect(yeldaChat.updateAssistantData(data, webchatSettings, href)).to.deep.equal(res)
    })

  })

  describe('yeldaChat.init', () => {
    it('should return typeof function', () => {
      assert.typeOf(yeldaChat.init, 'function', 'init function exists')
    })

    it('should set webChatContainer to null if !settingId && assistantId or assistantSlug are not passed', async () => {
      const mockData = {
        'locale': 'fr_FR'
      }

      yeldaChat.unLoadChat()
      await yeldaChat.init(mockData)
      expect(yeldaChat.webChatContainer).to.be.null
    })

    it('should create webChatContainer DOM element if settingId data is passed', async () => {
      const mockData = {
        'settingId': '600060987bcdfb0fe914808b',
      }
      yeldaChat.unLoadChat()
      await yeldaChat.init(mockData)
      expect(yeldaChat.webChatContainer).not.to.be.null
    })

    it('should create webChatContainer DOM element if required data are passed', async () => {
      const mockData = {
        'assistantSlug': 'sodebo',
        'assistantId': '12345678'
      }
      yeldaChat.unLoadChat()
      await yeldaChat.init(mockData)
      expect(yeldaChat.webChatContainer).not.to.be.null
    })
  })

  describe('yeldaChat.shouldChatBeLoaded', () => {
    it('should return false if data.bubbleContainerChildId & element does not exist', () => {
      expect(yeldaChat.shouldChatBeLoaded(null, { bubbleContainerChildId: 'test' })).to.be.false
    })

    it('should return true if webchatSettings is null & data.bubbleContainerChildId & element exists', () => {
      expect(yeldaChat.shouldChatBeLoaded(null, { bubbleContainerChildId: 'bubble' })).to.be.true
    })

    it('should return true if webchatSettings is null & data are null', () => {
      expect(yeldaChat.shouldChatBeLoaded(null, null)).to.be.true
    })

    it('should return true if webchatSettings.isActivated is true & data is null', () => {
      expect(yeldaChat.shouldChatBeLoaded({ isActivated: true })).to.be.true
    })

    it('should return false if webchatSettings.isActivated is false & data is null', () => {
      expect(yeldaChat.shouldChatBeLoaded({ isActivated: false })).to.be.false
    })

    it('should return false if webchatSettings.isActivated is true & data.bubbleContainerChildId & element does not exist', () => {
      expect(yeldaChat.shouldChatBeLoaded({ isActivated: true }, { bubbleContainerChildId: 'test' })).to.be.false
    })

    it('should return true if webchatSettings.isActivated is true & data.bubbleContainerChildId & element exists', () => {
      expect(yeldaChat.shouldChatBeLoaded({ isActivated: true }, { bubbleContainerChildId: 'bubble' })).to.be.true
    })
  })

  describe('yeldaChat.isDataOutdated', () => {
    it('should return false if data.settingId match the global settingId', () => {
      expect(yeldaChat.isDataOutdated({ settingId: '12345678' }, { settingId: '12345678' })).to.be.false
    })

    it('should return true if data.settingId does not match the global settingId', () => {
      expect(yeldaChat.isDataOutdated({ settingId: '12345678' }, { settingId: '12345679' })).to.be.true
    })

    it('should return true if data.assistantId match the global assistantId but not locale', () => {
      expect(yeldaChat.isDataOutdated({ assistantId: '12345678', locale: 'fr_FR' }, { assistantId: '12345678', locale: 'en_US' })).to.be.true
    })

    it('should return false if data.assistantId and locale match the global assistantId and locale', () => {
      expect(yeldaChat.isDataOutdated({ assistantId: '12345678', locale: 'fr_FR' }, { assistantId: '12345678', locale: 'fr_FR' })).to.be.false
    })
  })


  describe('yeldaChat.setupChat', () => {
    describe('yeldaChat.setupChat initial checks', () => {
      it('should set webChatContainer to null if assistantId  & settingId are missing', async () => {
        // Reset the DOM
        yeldaChat.unLoadChat()
        const mockData = {
          'assistantSlug': 'testClient',
          'chatPath': 'chat'
        }

        await yeldaChat.setupChat(mockData)
        expect(yeldaChat.webChatContainer).to.be.null
      })

      it('should set webChatContainer to null if settingId & assistantSlug are missing', async () => {
        // Reset the DOM
        yeldaChat.unLoadChat()
        const mockData = {
          'assistantId': 'testClient',
          'chatPath': 'chat'
        }

        await yeldaChat.setupChat(mockData)
        expect(yeldaChat.webChatContainer).to.be.null
      })

      it('should set webChatContainer if settingId data is passed', async () => {
        // Reset the DOM
        yeldaChat.unLoadChat()

        await yeldaChat.setupChat({settingId:'600060987bcdfb0fe914808b'})
        expect(yeldaChat.webChatContainer).not.to.be.null
      })

      it('should set webChatContainer if required data passed', async () => {
        // Reset the DOM
        yeldaChat.unLoadChat()

        await yeldaChat.setupChat(validMockData)
        expect(yeldaChat.webChatContainer).not.to.be.null
      })

      it('should not webChatContainer if data.bubbleContainerChildId is set & bubbleContainerChildId element does not exist', async () => {
        // Reset the DOM
        yeldaChat.unLoadChat()

        await yeldaChat.setupChat(Object.assign({ bubbleContainerChildId: 'test' }, validMockData))
        expect(yeldaChat.webChatContainer).to.be.null
      })

      it('should not set webChatContainer & bubbleContainer if data.bubbleContainerChildId is set & bubbleContainerChildId element does not exist', async () => {
        // Reset the DOM
        yeldaChat.unLoadChat()

        await yeldaChat.setupChat(Object.assign({ bubbleContainerChildId: 'test' }, validMockData))
        expect(yeldaChat.bubbleContainer).to.be.null
        expect(yeldaChat.webChatContainer).to.be.null
      })

      it('should set webChatContainer & bubbleContainer if data.bubbleContainerChildId is set & bubbleContainerChildId element exists', async () => {
        // Reset the DOM
        yeldaChat.unLoadChat()

        await yeldaChat.setupChat(Object.assign({ bubbleContainerChildId: 'bubble' }, validMockData))
        expect(yeldaChat.webChatContainer).not.to.be.null
        expect(yeldaChat.bubbleContainer).not.to.be.null
      })
    })

    describe('yeldaChat.createContainer', () => {
      before(async () => {
        yeldaChat.unLoadChat()
        await yeldaChat.setupChat(validMockData)
      })

      it('should create webChatContainer dom element', () => {
        expect(yeldaChat.webChatContainer).not.to.be.null
      })

      it('should define parentContainer', () => {
        expect(yeldaChat.parentContainer).not.to.be.null
      })

      it('expect webChatContainer exists in document', () => {
        document.querySelector('#yelda_container').should.exist
      })

      it('webChatContainer should have attribute id', () => {
        expect(yeldaChat.webChatContainer).to.have.attribute('id', 'yelda_container')
      })

      it('webChatContainer should have attribute class', () => {
        expect(yeldaChat.webChatContainer).to.have.attribute('class', 'yelda_container')
      })

      it('expect parentContainer contain webChatContainer', () => {
        expect(yeldaChat.parentContainer).to.contain(yeldaChat.webChatContainer)
      })


      describe('yeldaChat.addAssistantImage', () => {
        before(async () => {
          yeldaChat.unLoadChat()
          await yeldaChat.setupChat(validMockData)
        })

        it('should create assistantImage dom element', () => {
          yeldaChat.should.have.property('assistantImage')
        })

        it('expect yelda_assistant_img exists in document', () => {
          document.querySelector('#yelda_assistant_img').should.exist
        })

        it('assistantImage should have attribute id', () => {
          expect(yeldaChat.assistantImage).to.have.attribute('id', 'yelda_assistant_img')
        })

        it('assistantImage should have attribute class', () => {
          expect(yeldaChat.assistantImage).to.have.attribute('class', 'yelda_assistant_img default')
        })
      })

      describe('yeldaChat.updateAssistantImageWithAssistantSettings', () => {
        before(async () => {
          yeldaChat.unLoadChat()
          await yeldaChat.setupChat(validMockData)
        })

        it('expect assistantImage exists in document', () => {
          expect(yeldaChat.webChatContainer).to.contain(yeldaChat.assistantImage)
        })

        it('expect yelda_assistant_img exists in document', () => {
          document.querySelector('#yelda_assistant_img').should.exist
        })
      })
    })

    describe('yeldaChat.createWebChatURL', () => {
      it('should return valid iframe url', async () => {

        const mockData = {
          'assistantSlug': 'testClient',
          'assistantId': '12345678',
          'chatPath': 'chat',
          'locale': 'fr_FR',
          'isAdmin': true,
          'shouldBeOpened': true,
          'canBeClosed': true,
          'platformSimulated': 'alexa'
        }

        yeldaChat.unLoadChat()
        await yeldaChat.setupChat(mockData)

        const result = 'https://app.yelda.ai/chat?assistantId=12345678&assistantSlug=testClient&locale=fr_FR&location=https%3A%2F%2Fyelda.ai%2F&platformSimulated=alexa&canBeClosed=true&shouldBeOpened=true&isAdmin=true'
        expect(yeldaChat.createWebChatURL(mockData)).to.deep.equal(result)
      })

      it('should return valid iframe url without isAdmin and isStartBtn to false if is isAdmin=false & isStartBtn=true', async () => {
        const mockData = {
          'assistantSlug': 'testClient',
          'assistantId': '12345678',
          'iframeURL': 'https://app.yelda.ai/chat',
          'chatPath': 'chat',
          'locale': 'fr_FR',
          'isAdmin': false,
          'isStartBtn': true,
          'shouldBeOpened': true,
          'canBeClosed': true
        }

        yeldaChat.unLoadChat()
        await yeldaChat.setupChat(mockData)

        const result = 'https://app.yelda.ai/chat?assistantId=12345678&assistantSlug=testClient&locale=fr_FR&location=https%3A%2F%2Fyelda.ai%2F&canBeClosed=true&shouldBeOpened=true&isStartBtn=false'
        expect(yeldaChat.createWebChatURL(mockData)).to.deep.equal(result)
      })

      it('should return valid iframe url including isStartBtn to true if isStartBtn=true & isAdmin=true', async () => {
        const mockData = {
          'assistantSlug': 'testClient',
          'assistantId': '12345678',
          'iframeURL': 'https://app.yelda.ai/chat',
          'chatPath': 'chat',
          'locale': 'fr_FR',
          'isAdmin': true,
          'shouldBeOpened': true,
          'isStartBtn': true,
          'canBeClosed': true
        }

        yeldaChat.unLoadChat()
        await yeldaChat.setupChat(mockData)

        const result = 'https://app.yelda.ai/chat?assistantId=12345678&assistantSlug=testClient&locale=fr_FR&location=https%3A%2F%2Fyelda.ai%2F&canBeClosed=true&shouldBeOpened=true&isAdmin=true&isStartBtn=true'
        expect(yeldaChat.createWebChatURL(mockData)).to.deep.equal(result)
      })
    })

    describe('yeldaChat.createWebChatFrame', () => {
      before(async () => {
        yeldaChat.unLoadChat()
        await yeldaChat.setupChat(validMockData)
      })

      it('should create iframeContainer dom element', () => {
        yeldaChat.should.have.property('iframeContainer')
      })

      it('expect iframeContainer exists in document', () => {
        expect(yeldaChat.webChatContainer).to.contain(yeldaChat.iframeContainer)
      })

      it('iframeContainer should have attribute id', () => {
        expect(yeldaChat.iframeContainer).to.have.attribute('id', 'yelda_iframe_container')
      })

      it('iframeContainer should have attribute class', () => {
        expect(yeldaChat.iframeContainer).to.have.attribute('class', 'yelda_iframe_container')
      })

      it('should create webChatIframe dom element', () => {
        yeldaChat.should.have.property('webChatIframe')
      })

      it('expect webChatIframe exists in iframeContainer', () => {
        expect(yeldaChat.iframeContainer).to.contain(yeldaChat.webChatIframe)
      })

      it('webChatIframe should have attribute id', () => {
        expect(yeldaChat.webChatIframe).to.have.attribute('id', 'web_chat_frame')
      })

      it('webChatIframe should have attribute url', () => {
        const result = 'https://app.yelda.ai/chat?assistantId=12345678&assistantSlug=testClient&locale=fr_FR&location=https%3A%2F%2Fyelda.ai%2F'
        expect(yeldaChat.webChatIframe.getAttribute('src')).to.deep.equal(result)
      })
    })

    describe('yeldaChat.initWebChatContainerYActiveClass', () => {
      before(async () => {
        yeldaChat.unLoadChat()
        const mockData = {
          'assistantSlug': 'testClient',
          'assistantId': '12345678',
          'iframeURL': 'https://app.yelda.ai/chat',
          'chatPath': 'chat',
          'locale': 'fr_FR',
          'isAdmin': true,
          'shouldBeOpened': true,
          'isStartBtn': true,
          'canBeClosed': false
        }
        await yeldaChat.setupChat(mockData)
      })

      it('webChatContainer should have attribute class y_active when the webchat force to open and can\'t be closed', () => {
        expect(yeldaChat.webChatContainer).to.have.attribute('class', 'yelda_container y_active')
      })
    })

    describe('yeldaChat.bubbleContainer', () => {
      before(async () => {
        yeldaChat.unLoadChat()
        const validMockData = {
          'assistantSlug': 'testClient',
          'assistantId': '12345678',
          'chatPath': 'chat',
          'bubbleContainerChildId': 'bubble'
        }
        await yeldaChat.setupChat(validMockData)
      })

      it('expect yelda_assistant_img exists in document', () => {
        expect(document.querySelector('#bubble')).to.be.null
        document.querySelector('#yelda_assistant_img').should.exist
      })

      it('expect bubbleContainerChildId added back to the document', () => {
        yeldaChat.unLoadChat()
        expect(document.querySelector('#yelda_assistant_img')).to.be.null
        document.querySelector('#bubble').should.exist
      })
    })
  })

  describe('yeldaChat.resetChat', () => {
    it('should use the data from the latest call to build the iframe url', async () => {
      yeldaChat.resetChat(Object.assign({}, validMockData, { locale: 'fr_FR' }))
      await yeldaChat.resetChat(Object.assign({}, validMockData, { locale: 'en_US' }))

      const result = 'https://app.yelda.ai/chat?assistantId=12345678&assistantSlug=testClient&locale=en_US&location=https%3A%2F%2Fyelda.ai%2F'
      expect(yeldaChat.webChatIframe.getAttribute('src')).to.deep.equal(result)
    })

    it('should not set webChatContainer if the loadChat locale parameter does not match the global locale', async () => {
      yeldaChat.unLoadChat()
      yeldaChat.locale = 'en_US'
      yeldaChat.parentContainer = document.body
      await yeldaChat.loadChat(validMockData)

      expect(yeldaChat.webChatContainer).to.be.null
    })

    describe('yeldaChat.resetChat', () => {
      before(async () => {
        yeldaChat.unLoadChat()
        await yeldaChat.setupChat(validMockData)
      })

      it('iframeContainer should not be empty after reset', async () => {
        await yeldaChat.resetChat(validMockData)
        document.querySelector('#yelda_iframe_container').should.exist
      })

      it('It does not throw error if assistantImg is missing', (done, fail) => {
        const mockData = {
          'assistantSlug': 'testClient',
          'assistantId': '12345678',
          'chatPath': 'chat',
          'locale': 'fr_FR',
          'isAdmin': true
        }

        document.getElementById('yelda_assistant_img').remove()

        try {
          yeldaChat.resetChat(mockData)
        } catch (error) {
          fail()
        }

        done()
      })

    })

    describe('yeldaChat.unLoadChat', () => {
      it('iframeContainer & webChatIframe & webChatContainer & parentContainer should be remove after unLoadChat', () => {
        yeldaChat.unLoadChat()
        expect(yeldaChat.iframeContainer).to.be.null
        expect(yeldaChat.webChatIframe).to.be.null
        expect(yeldaChat.webChatContainer).to.be.null
        expect(yeldaChat.parentContainer).to.be.null
      })

      it('#yelda_container & #yelda_iframe_container should be empty after unLoadChat', () => {
        yeldaChat.unLoadChat()
        expect(document.querySelector('#yelda_container')).to.be.null
        expect(document.querySelector('#yelda_iframe_container')).to.be.null
      })
    })
  })

  describe('yeldaChat.parseFunctionString', () => {
    it('should return {functionName: "this.bla", args: ["test"] if passed "this.bla("test")"', () => {
      const data = {functionName: 'this.bla', args: ['test']}
      expect(yeldaChat.parseFunctionString("this.bla('test')")).to.deep.equal(data)
    })

    it('should return {functionName: "this.bla", args: [true, 3, "test", [1, 2], {x: "x"}] if passed "this.bla(true, 3, "test", [1,2], {x:"x"})', () => {
      const data = {functionName: 'this.bla', args: [true, 3, 'test', [1, 2], {x: 'x'}]}
      // Objects are JSON stringified + URL encoded
      expect(yeldaChat.parseFunctionString("this.bla(true, 3, 'test', '%5B1%2C2%5D', '%7B%22x%22%3A%22x%22%7D')")).to.deep.equal(data)
    })


    it('should return {functionName: "data.push", args: [{"success": true}] if passed "data.push({success: true})', () => {
      const data = {functionName: 'data.push', args: [{success: 'true'}]}
      expect(yeldaChat.parseFunctionString("data.push({'success': 'true'})")).to.deep.equal(data)
    })

    it('should return {functionName: "data.push", args: [[1, 2, "three"]] if passed "data.push({success: true})', () => {
      // Arrays need to be encoded, because it contains "," which breaks the argument separation regex in parseFunctionString
      const param = [1, 2, "three"]
      const encodedParam = encodeURIComponent(JSON.stringify(param))
      const data = {functionName: 'data.push', args: [param]}

      expect(yeldaChat.parseFunctionString("data.push("+encodedParam+")")).to.deep.equal(data)
    })
  })

  /**
   * Since we are resetting and updating the mockRequest(voiceFirstUI & isActivated settings),
   * if platformSettings test cases runs parallel with other test cases,
   * it causes error due to asynchronous nature.
   * So "after" root level hook is used to run the platformSettings test cases after
   * all other test cases are executed
   */
  after(() => {
    describe('yeldaChat.platformSettings', () => {
      describe('yeldaChat.voiceFirstUI', () => {
        before(async () => {
          mock.reset()
          mock.get(testAPIUrls[0], {
            status: 201,
            body: JSON.stringify({ data: {isVoiceFirstUI: true} })
          })

          yeldaChat.unLoadChat()

          await yeldaChat.setupChat(validMockData)
        })

        it('should contain voiceFirstUI class', (done) => {
          expect(yeldaChat.iframeContainer).to.have.attribute('class', 'yelda_iframe_container voiceFirstUI')
          done()
        })

        it('expect assistantImage not exists in document', (done) => {
          expect(yeldaChat.assistantImage).to.be.null
          done()
        })

        it('should not contain assistant image', (done) => {
          expect(document.querySelector('#yelda_assistant_img')).to.be.null
          done()
        })
      })

      describe('yeldaChat.bubbleText set', () => {
        before((done) => {
          mock.reset()
          mock.get(testAPIUrls[0], {
            status: 201,
            body: JSON.stringify({ data: { bubbleText: 'coucou' } })
          })

          yeldaChat.unLoadChat()
          yeldaChat.setupChat(validMockData).then(() => {
            yeldaChat.webChatIframe.contentWindow.parent.postMessage('addBubbleText', '*')
            // Delay is added to give time for messageListener to updates the assistant bubble text
            setTimeout(() => {done()}, 100)
          })
        })

        it('should set assistantBubbleText', () => {
          expect(yeldaChat.assistantBubbleText).not.to.be.null
          expect(yeldaChat.assistantBubbleText).not.to.be.undefined
          expect(yeldaChat.assistantBubbleText).to.have.rendered.text('coucou')
        })

        it('should add assistantBubbleText to webChatContainer', () => {
          expect(yeldaChat.webChatContainer).to.contain('span')
          expect(yeldaChat.webChatContainer).to.contain(yeldaChat.assistantBubbleText)
        })
      })

      describe('yeldaChat.bubbleText not set', () => {
        before(async () => {
          mock.reset()
          mock.get(testAPIUrls[0], {
            status: 201,
            body: JSON.stringify({ data: { bubbleText: '' } })
          })

          yeldaChat.unLoadChat()
          await yeldaChat.setupChat(validMockData)
        })


        it('should not set assistantBubbleText element', () => {
          expect(yeldaChat.assistantBubbleText).to.be.null
          expect(yeldaChat.webChatContainer).not.to.contain('span')
        })
      })

      describe('yeldaChat.bubbleText is set on triggering minimal notification', () => {
        before((done) => {
          yeldaChat.unLoadChat()
          yeldaChat.setupChat(validMockData).then(() => {
            yeldaChat.webChatIframe.contentWindow.parent.postMessage(
              { event: 'addMinimalNotificationText', text: 'Minimal notification message' },
              '*'
            )
            // Delay is added to give time for messageListener to updates the assistant bubble text
            setTimeout(() => {done()}, 100)
          })
        })

        it('should set assistantBubbleText for notification', () => {
          expect(yeldaChat.assistantBubbleText).not.to.be.null
          expect(yeldaChat.assistantBubbleText).not.to.be.undefined
          expect(yeldaChat.assistantBubbleText).to.have.rendered.text('Minimal notification message')
        })

        it('should add assistantBubbleText to webChatContainer', () => {
          expect(yeldaChat.webChatContainer).to.contain('span')
          expect(yeldaChat.webChatContainer).to.contain(yeldaChat.assistantBubbleText)
        })

        it('should contain close button if the assistantBubbleText exists', () => {
          expect(yeldaChat.assistantBubbleText).to.contain('a.bubbleCloseButton')
        })

        it('should assistantBubbleText to be removed while clicking the bubbleCloseButton', () => {
          document.getElementById('yelda_assistant_bubble_text_close').click()
          expect(yeldaChat.assistantBubbleText).to.be.null
          expect(yeldaChat.webChatContainer).not.to.contain('span')
        })
      })

    describe('yeldaChat.bubbleText should be removed while opening the webchat window', () => {
        before((done) => {
          yeldaChat.unLoadChat()
          yeldaChat.setupChat(validMockData).then(() => {
            yeldaChat.webChatIframe.contentWindow.parent.postMessage(
              { event: 'addMinimalNotificationText', text: 'Minimal notification message' },
              '*'
            )

            // Delay is added to give time for messageListener to updates the assistant bubble text
            setTimeout(() => {
              yeldaChat.openChat()
              done()
            }, 100)

          })
        })

        it('should not set assistantBubbleText element', () => {
          expect(yeldaChat.assistantBubbleText).to.be.null
          expect(yeldaChat.webChatContainer).not.to.contain('span')
        })

        it('should webChatContainer have y_active after opening the webchat', () => {
          expect(yeldaChat.webChatContainer).to.have.attribute('class', 'yelda_container y_active')
        })
      })

      describe('yeldaChat.closeChat hide the webchat iframe', () => {
        before((done) => {
            // Delay is added to give time for messageListener to updates the assistant bubble text
          setTimeout(() => {
            yeldaChat.closeChat()
            done()
          }, 100)
        })

        it('should webChatContainer note have y_active after closing the webchat', () => {
          expect(yeldaChat.webChatContainer).to.have.attribute('class', 'yelda_container')
        })
      })

      describe('yeldaChat.isActivated', () => {
        before(async () => {
          mock.reset()
          mock.get(testAPIUrls[0], {
            status: 201,
            body: JSON.stringify({ data: {isActivated: false} })
          })

          yeldaChat.unLoadChat()
          await yeldaChat.setupChat(validMockData)
        })

        it('iframeContainer & webChatIframe & webChatContainer & parentContainer should be removed when webchat is not activated', () => {
          expect(yeldaChat.iframeContainer).to.be.null
          expect(yeldaChat.webChatIframe).to.be.null
          expect(yeldaChat.webChatContainer).to.be.null
          expect(yeldaChat.parentContainer).to.be.null
        })
      })
    })
  })
})
