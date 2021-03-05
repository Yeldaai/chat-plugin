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

const testAPIUrl = 'https://app.yelda.ai/assistants/12345678/chatBubble/fr_FR'
// mock.setup() sets global.XMLHttpRequest with mock xhr
mock.setup()
mock.get(testAPIUrl, {
  status: 201,
  body: JSON.stringify({ data: {} })
})

// To Fix undefined error on navigator while running the test
global.navigator = {
  userAgent: 'node.js'
}

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

    it('should return nothing(undefined) if required data passed', () => {
      const mockData = {
        'assistantSlug': 'sodebo',
        'assistantId': '12345678'
      }

      const response = yeldaChat.init(mockData)
      assert.typeOf(response, 'undefined', 'init function returns undefined')
    })

    it('should create webChatContainer DOM element if required data are passed', () => {
      const mockData = {
        'assistantSlug': 'sodebo',
        'assistantId': '12345678'
      }

      yeldaChat.init(mockData)
      setTimeout(() => {
        expect(yeldaChat.webChatContainer).not.to.be.null
      })
    })
  })

  describe('yeldaChat.setupChat', () => {
    describe('yeldaChat.setupChat initial checks', () => {
      it('should return null if assistantId is missing', async () => {
        // Reset the DOM
        yeldaChat.unLoadChat()
        const mockData = {
          'assistantSlug': 'testClient',
          'chatPath': 'chat'
        }

        await yeldaChat.setupChat(mockData)
        expect(yeldaChat.webChatContainer).to.be.null
      })

      it('should return null if assistantSlug is missing', async () => {
        // Reset the DOM
        yeldaChat.unLoadChat()
        const mockData = {
          'assistantId': 'testClient',
          'chatPath': 'chat'
        }

        await yeldaChat.setupChat(mockData)
        expect(yeldaChat.webChatContainer).to.be.null
      })
    })

    describe('yeldaChat.createContainer', async() => {
      // Reset the DOM
      yeldaChat.unLoadChat()
      await yeldaChat.setupChat(validMockData)
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


      describe('yeldaChat.addAssistantImage', async () => {
        // Reset the DOM
        yeldaChat.unLoadChat()
        await yeldaChat.setupChat(validMockData)
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

      describe('yeldaChat.updateAssistantImageWithAssistantSettings', async () => {
        yeldaChat.unLoadChat()
        await yeldaChat.setupChat(validMockData)
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
          'chatUrl': 'https://app.yelda.ai/chat',
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
          'chatUrl': 'https://app.yelda.ai/chat',
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

    describe('yeldaChat.createWebChatFrame', async () => {
      yeldaChat.unLoadChat()
      await yeldaChat.setupChat(validMockData)

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
  })

  describe('yeldaChat.resetChat', () => {
    describe('yeldaChat.resetChat', async () => {
      yeldaChat.unLoadChat()
      await yeldaChat.setupChat(validMockData)
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

  /**
   * Since we are resetting and updating the mockRequest if platformSettings test cases run with
   * other test cases parallely it causes error due to asynchronous nature.
   * So "after" root level hook used to run the platformSettings test cases after
   * all other test cases are finished
   */
  after(() => {
    describe('yeldaChat.platformSettings', async () => {
      describe('yeldaChat.voiceFirstUI', async () => {
        mock.reset()
        mock.get(testAPIUrl, {
          status: 201,
          body: JSON.stringify({ data: {isVoiceFirstUI: true} })
        })

        yeldaChat.unLoadChat()
        yeldaChat.setupChat(validMockData)

        it('should contain voiceFirstUI class', (done) => {
          expect(yeldaChat.iframeContainer).to.have.attribute('class', 'yelda_iframe_container voiceFirstUI y_active')
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

      describe('yeldaChat.publicationStatus', () => {
        it('iframeContainer & webChatIframe & webChatContainer & parentContainer should be removed when publicationStatus is disabled', async () => {
          mock.reset()
          mock.get(testAPIUrl, {
            status: 201,
            body: JSON.stringify({ data: {publicationStatus: false} })
          })

          // Reset the DOM
          yeldaChat.unLoadChat()
          await yeldaChat.setupChat(validMockData)
          expect(yeldaChat.iframeContainer).to.be.null
          expect(yeldaChat.webChatIframe).to.be.null
          expect(yeldaChat.webChatContainer).to.be.null
          expect(yeldaChat.parentContainer).to.be.null
        })
      })
    })
  })
})
