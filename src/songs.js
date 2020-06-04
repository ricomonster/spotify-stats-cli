const axios = require('axios');
const Table = require('cli-table3');

const Spotify = require('./spotify');
const Token = require('./token');

class Songs {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.token = new Token();
    this.limit = 50;
  }

  async getTracks(token, timeRange = 'short_term') {
    // Initialize spotify
    const spotify = new Spotify({ accessToken: token });

    try {
      const response = await spotify.getUserTop('tracks', { time_range: timeRange });
      const { items } = response.data;

      return items;
    } catch (error) {
      if (error && error.response && error.response.status === 401) {
        // Expired token
        const token = await this.refreshAccessTokens();

        // retry the request
        return this.getTracks(token, timeRange);
      }
    }
  }

  async process(args) {
    // Do we have a range in the args?
    let range;
    if (args.range) {
      switch (args.range) {
        case '--alltime':
          range = 'long_term';
          break;

        case '--4weeks':
          range = 'short_term';
          break;

        case '--6months':
          range = 'medium_term';
          break;

        default:
          console.log('Unknown option.');
          return false;
      }
    }

    // Check first if the user is already authenticated
    const token = this.token.getAccessToken();

    if (!token) {
      console.log('Not yet authenticated! Run spotify-stats-cli login to authenticate');
      return false;
    }

    // Let's go!
    const tracks = await this.getTracks(token, range);

    // Save the ranking somewhere

    // Render the list
    console.log(`Your Top ${this.limit} Tracks ${this.renderDuration(range)}.`);
    return this.renderTrackList(tracks);
  }

  async refreshAccessTokens() {
    // instantiate spotify class
    const spotify = new Spotify({ clientId: this.clientId, clientSecret: this.clientSecret });

    // Get the refresh token
    const refreshToken = this.token.getRefreshToken();

    try {
      const response = await spotify.refreshTokens(refreshToken);
      const { access_token } = response.data;

      // update the access token
      await this.token.storeAccessToken(access_token);

      return access_token;
    } catch (error) {
      console.log('err', error);
    }
  }

  renderDuration(range = 'short_term') {
    switch (range) {
      case 'long_term':
        return 'of All Time';

      case 'medium_term':
        return 'in the last 6 months';

      case 'short_term':
      default:
        return 'in the last 4 weeks';
    }
  }

  renderTrackList(tracks) {
    // Set the header
    const table = new Table({
      head: ['Rank', 'Title', 'Artist'],
    });

    tracks.forEach((track, index) => {
      const artists = [];

      // Get the artists as there's a possibility to have multiple artists
      track.artists.forEach((artist) => {
        artists.push(artist.name);
      });

      table.push([index + 1, track.name, artists.join(', ')]);
    });

    console.log(table.toString());
  }
}

module.exports = Songs;
