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

const { expect, should, use, assert } = require('chai')
const MockXMLHttpRequest = require('mock-xmlhttprequest')
const MockXhr = MockXMLHttpRequest.newMockXhr()

// Mock JSON response
MockXhr.onSend = (xhr) => {
  const responseHeaders = { 'Content-Type': 'application/json' }
  const response = '{ "message": "Success!" }'
  xhr.respond(200, responseHeaders, response)
};

// Install in the global context so "new XMLHttpRequest()" uses the XMLHttpRequest mock
global.XMLHttpRequest = MockXhr

should()
use(require('chai-dom'))

const jsdom = require('jsdom')
const { JSDOM } = jsdom

describe('YeldaChat', () => {
  const { window } = new JSDOM(`...`)

  global.window = window
  global.document = window.document

  const yeldaChat = require('../dist/js/yeldaWebchatInjector.min')

  // yeldaChat should be a object and yeldaChat.init should be a typeof function
  it('should return typeof object', (done) => {
    assert.typeOf(yeldaChat, 'object', 'we have an object')
    done()
  })

  describe('yeldaChat.init', () => {
    it('should return typeof function', () => {
      assert.typeOf(yeldaChat.init, 'function', 'init function exists')
    })

    it('should return null if assistantId or assistantSlug are not passed', () => {
      const mockData = {
        'locale': 'fr_FR'
      }

      const response = yeldaChat.init(mockData)
      assert.typeOf(response, 'null', 'init function returns null')
    })

    it('should return nothing(undfined) if required data passed', () => {
      const mockData = {
        'assistantSlug': 'sodebo',
        'assistantId': '5b7edb2b1060312cfeaa791f',
      }

      const response = yeldaChat.init(mockData)
      assert.typeOf(response, 'undefined', 'init function returns undefined')
    })

  })

  describe('yeldaChat.setupChat', () => {

    describe('yeldaChat.setupChat initial checks', () => {
      it('should return null if assistantId is missing', () => {
        const mockData = {
          'assistantSlug': 'testClient',
          'chatPath': 'chat'
        }

        const response = yeldaChat.setupChat(mockData)

        assert.typeOf(response, 'null', 'setupChat function returns null')
        expect(yeldaChat.webChatContainer).to.be.null
      })
      it('should return null if assistantSlug is missing', () => {
        const mockData = {
          'assistantId': 'testClient',
          'chatPath': 'chat'
        }

        const response = yeldaChat.setupChat(mockData)

        assert.typeOf(response, 'null', 'setupChat function returns null')
        expect(yeldaChat.webChatContainer).to.be.null
      })
    })

  describe('yeldaChat.createContainer', () => {
    it('should create webChatContainer dom element', () => {
      const mockData = {
        'assistantSlug': 'testClient',
        'assistantId': '12345678',
        'chatPath': 'chat'
      }

      yeldaChat.setupChat(mockData)
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
  })

  describe('yeldaChat.addAssistantImage', () => {
    it('should create assistantImage dom element', () => {
      yeldaChat.should.have.property('assistantImage')
    })

    it('expect assistantImage exists in document', () => {
      expect(yeldaChat.webChatContainer).to.contain(yeldaChat.assistantImage)
    })

    it('assistantImage should have attribute id', () => {
      expect(yeldaChat.assistantImage).to.have.attribute('id', 'assistant_img')
    })

    it('assistantImage should have attribute class', () => {
      expect(yeldaChat.assistantImage).to.have.attribute('class', 'assistant_img default')
    })
  })

  describe('yeldaChat.createWebChatURL', () => {
    it('should return valid iframe url', () => {
      const mockData = {
        'assistantSlug': 'testClient',
        'assistantId': '12345678',
        'chatUrl': 'https://app.yelda.ai/chat',
        'locale': 'fr_FR',
        'isAdmin': true,
        'shouldBeOpened': true,
        'canBeClosed': true
      }

      const result = 'https://app.yelda.ai/chat?assistantId=12345678&assistantSlug=testClient&locale=fr_FR&canBeClosed=true&shouldBeOpened=true&isAdmin=true'
      expect(yeldaChat.createWebChatURL(mockData)).to.deep.equal(result)
    })

    it('should return valid iframe url without isAdmin and isStartBtn to false if is isAdmin=false & isStartBtn=true', () => {
      const mockData = {
        'assistantSlug': 'testClient',
        'assistantId': '12345678',
        'chatUrl': 'https://app.yelda.ai/chat',
        'locale': 'fr_FR',
        'isAdmin': false,
        'isStartBtn': true,
        'shouldBeOpened': true,
        'canBeClosed': true
      }

      const result = 'https://app.yelda.ai/chat?assistantId=12345678&assistantSlug=testClient&locale=fr_FR&canBeClosed=true&shouldBeOpened=true&isStartBtn=false'
      expect(yeldaChat.createWebChatURL(mockData)).to.deep.equal(result)
    })

    it('should return valid iframe url including isStartBtn to true if isStartBtn=true & isAdmin=true', () => {
      const mockData = {
        'assistantSlug': 'testClient',
        'assistantId': '12345678',
        'chatUrl': 'https://app.yelda.ai/chat',
        'locale': 'fr_FR',
        'isAdmin': true,
        'shouldBeOpened': true,
        'isStartBtn': true,
        'canBeClosed': true
      }

      const result = 'https://app.yelda.ai/chat?assistantId=12345678&assistantSlug=testClient&locale=fr_FR&canBeClosed=true&shouldBeOpened=true&isAdmin=true&isStartBtn=true'
      expect(yeldaChat.createWebChatURL(mockData)).to.deep.equal(result)
    })
  })

  describe('yeldaChat.createWebChatFrame', () => {
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
      const result = 'https://app.yelda.ai/chat?assistantId=12345678&assistantSlug=testClient&locale=fr_FR&canBeClosed=false&shouldBeOpened=false'
      expect(yeldaChat.webChatIframe.getAttribute('src')).to.deep.equal(result)
    })
  })
})

  describe('yeldaChat.resetChat', () => {
    describe('yeldaChat.resetChat', () => {
      it('iframeContainer should not be empty after reset', () => {
        const mockData = {
          'assistantSlug': 'testClient',
          'assistantId': '12345678',
          'chatUrl': 'https://app.yelda.ai/chat',
          'locale': 'fr_FR',
          'isAdmin': true
        }

        yeldaChat.resetChat(mockData)

        document.querySelector('#yelda_iframe_container').should.exist
      })

      it('It does not throw error if assistantImg is missing', (done, fail) => {
        const mockData = {
          'assistantSlug': 'testClient',
          'assistantId': '12345678',
          'chatUrl': 'https://app.yelda.ai/chat',
          'locale': 'fr_FR',
          'isAdmin': true
        }

        document.getElementById('assistant_img').remove()

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
})
