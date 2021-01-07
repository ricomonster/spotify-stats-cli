const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');

const Spotify = require('src/services/spotify');

describe('Services :: Spotify', () => {
  context('should work properly', () => {
    let spotifyClass;

    before(() => {
      spotifyClass = new Spotify({
        clientId: '1234567890',
        clientSecret: '0987654321',
      });
    });

    after(() => {});

    it('should return an access and refresh tokens', async () => {
      sinon
        .stub(axios, 'post')
        .resolves(
          Promise.resolve({ data: { access_token: '1234567890', refresh_token: '0987654321' } })
        );

      const response = await spotifyClass.getAccessToken('1234567890');

      expect(response).to.be.an('object');
      expect(response).to.have.property('data');
    });
  });

  context('should not work properly', () => {
    it('should return an access and refresh tokens', async () => {
      const spotifyClass = new Spotify();

      try {
        await spotifyClass.getAccessToken('1234567890');
      } catch (error) {
        expect(error.message).to.be.equal('Client ID or Secret is required.');
      }
    });
  });
});
