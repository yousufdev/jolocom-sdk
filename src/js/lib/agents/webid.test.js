/* global describe: true, it: true */
var expect = require('chai').expect
import {Parser} from '../rdf'
// import HTTPAgent from './http'
import WebIDAgent from './webid'

const DUMMY_TEXT = `@prefix pro: <./>.
@prefix n0: <http://xmlns.com/foaf/0.1/>.
@prefix cert: <http://www.w3.org/ns/auth/cert#>.
@prefix sp: <http://www.w3.org/ns/pim/space#>.
@prefix new: </>.
@prefix terms: <http://www.w3.org/ns/solid/terms#>.
@prefix inbox: </inbox/>.
@prefix ter: <http://purl.org/dc/terms/>.
@prefix XML: <http://www.w3.org/2001/XMLSchema#>.
@prefix rd: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix c: <https://isabel.webid.jolocom.de/profile/card#>.
@prefix c0: <https://eugen.webid.jolocom.de/profile/card#>.
@prefix c2: <https://joachim.webid.jolocom.de/profile/card#>.
@prefix schem: <https://schema.org/>.
@prefix c4: <https://lovius.webid.jolocom.de/profile/card#>.
@prefix c5: <https://annika.webid.jolocom.de/profile/card#>.
   pro:card a n0:PersonalProfileDocument; 
   n0:maker <#me>; n0:primaryTopic <#me> .
<#me>
    a    n0:Person;
    cert:key
       <#key-1470733038210>;
    sp:preferencesFile
       </settings/prefs.ttl>;
    sp:storage
       new:;
    terms:inbox
       inbox:;
    n0:givenName
       "newuser";
    n0:familyName
       "whoopie";
    n0:name
       "newuser whoopie";
    n0:img
       "https://newuser.webid.jolocom.de/files/66553399-pj.jpg";
    n0:accountName
       "http://twitter.com/tweeter";
    n0:phone
       "049 9374829438";
    n0:based_near
       "Berlin";
    n0:currentProject
       "dreamer";
    n0:workplaceHomepage
       "Jolocom";
    n0:homepage
       "http://jolocom.com";
    n0:knows
       c5:me, c0:me, c:me, c2:me, c4:me;
    n0:mbox
       <mailto:newuser@yopmail.com>;
    schem:isRelatedTo
       new:8ncs0, new:mb7jd, new:qakkr, new:w6y2r.
<#key-1470733038210>
    ter:created
       "2016-08-09T08:57:18.210Z"^^XML:dateTime;
    ter:title
       "Created by solid-server";
    a    cert:RSAPublicKey;
    rd:label
       "undefined";
    cert:exponent
       "65537"^^XML:int;
    cert:modulus
        "F2F728B2A763F049BA7FEE7DA24426B505BE658A21865"^^XML:hexBinary.`

const IMG_URI_TEXT = `@prefix pro: <./>.
@prefix n0: <http://xmlns.com/foaf/0.1/>.
pro:card a n0:PersonalProfileDocument; 
n0:maker <#me>; n0:primaryTopic <#me> .
<#me>
a    n0:Person;
     n0:givenName
     "newuser";
     n0:img
     "garbage$^*@#)rtret___::W".`

const NAME_TEXT = `@prefix pro: <./>.
@prefix n0: <http://xmlns.com/foaf/0.1/>.
pro:card a n0:PersonalProfileDocument; 
n0:maker <#me>; n0:primaryTopic <#me> .
<#me>
a    n0:Person;
     n0:name
     "newuser whoopie".`

const DUMMY_HTML_HEADERS = {
  get: (field) => ({
    'Content-Type': 'text/html'
  })[field]
}

describe('WebIDAgent', function() {
  var webId = 'https://newuser.webid.jolocom.de/profile/card#me'

  describe('#getWebId', function() {
    it('should return locally stored webID', async () => {

      localStorage.clear()
      localStorage.setItem(
        'jolocom.smartWallet',
        `{"webId": ${webId}}`
      )

      const agent = new WebIDAgent()
      webId = agent.getWebId()
      expect(webId).to.deep.equal(webId)
    })
  })

  describe('#updateProfile', function() {
    it('should return the added data in the profile', async () => {
      const oldProfile = {
        givenName: 'newuser',
        webId: 'https://anyolduser.webid.jolocom.de/profile/card#me'
      }
      const newProfile = {
        givenName: 'newuser',
        socialMedia: 'http://twitter.com/tweeter',
        mobilePhone: '049 9374829438',
        webId: 'https://anyolduser.webid.jolocom.de/profile/card#me'
      }
      const agent = new WebIDAgent()
      const fakeResponse = {
        status: 200,
        responseText: 'ya',
        headers: DUMMY_HTML_HEADERS,
        text: function() {
          return this.responseText
        }
      }
      agent.http._fetch = async (url, options) => {
        return fakeResponse
      }
      var profile = await agent.updateProfile(newProfile, oldProfile)
      expect(profile).to.deep.equal({
        givenName: 'newuser',
        socialMedia: 'http://twitter.com/tweeter',
        mobilePhone: '049 9374829438',
        webId: 'https://anyolduser.webid.jolocom.de/profile/card#me'
      })
    })

    it('should return the profile without the removed data', async () => {
      const oldProfile = {
        givenName: 'newuser',
        socialMedia: 'http://twitter.com/tweeter',
        mobilePhone: '049 9374829438',
        webId: 'https://anyolduser.webid.jolocom.de/profile/card#me'
      }
      const newProfile = {
        givenName: 'newuser',
        socialMedia: 'http://twitter.com/tweeter',
        webId: 'https://anyolduser.webid.jolocom.de/profile/card#me'
      }
      const agent = new WebIDAgent()
      const fakeResponse = {
        status: 200,
        responseText: 'ya',
        headers: DUMMY_HTML_HEADERS,
        text: function() {
          return this.responseText
        }
      }
      agent.http._fetch = async (url, options) => {
        return fakeResponse
      }
      var profile = await agent.updateProfile(newProfile, oldProfile)
      expect(profile).to.deep.equal({
        givenName: 'newuser',
        socialMedia: 'http://twitter.com/tweeter',
        webId: 'https://anyolduser.webid.jolocom.de/profile/card#me'
      })
    })

    it('should return the profile with the updated data', async () => {
      const oldProfile = {
        givenName: 'newuser',
        socialMedia: 'http://twitter.com/tweeter',
        mobilePhone: '049 9374829438',
        webId: 'https://anyolduser.webid.jolocom.de/profile/card#me'
      }
      const newProfile = {
        givenName: 'newuser',
        socialMedia: 'http://twitter.com/tweeter',
        mobilePhone: '049 1111111111',
        webId: 'https://anyolduser.webid.jolocom.de/profile/card#me'
      }
      const agent = new WebIDAgent()
      const fakeResponse = {
        status: 200,
        responseText: 'ya',
        headers: DUMMY_HTML_HEADERS,
        text: function() {
          return this.responseText
        }
      }
      agent.http._fetch = async (url, options) => {
        return fakeResponse
      }
      var profile = await agent.updateProfile(newProfile, oldProfile)
      expect(profile).to.deep.equal({
        givenName: 'newuser',
        socialMedia: 'http://twitter.com/tweeter',
        mobilePhone: '049 1111111111',
        webId: 'https://anyolduser.webid.jolocom.de/profile/card#me'
      })
    })
  })
})
