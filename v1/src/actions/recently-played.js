const Table = require('cli-table3');
const chalk = require('chalk');
const ora = require('ora');

// Dependencies
const Config = require('./config');
const Spotify = require('./../services/spotify');

class RecentlyPlayed {
  constructor() {
    this.config = new Config();

    this.clientId = this.config.storage.get('clientId');
    this.clientSecret = this.config.storage.get('clientSecret');
  }

  async process(args) {
    try {
      // Check first if the user is already authenticated
      const token = this.config.storage.get('accessToken');

      if (!token) {
        console.log('Not yet authenticated! Run spotify-stats- login to authenticate');
        return false;
      }

      // Show spinner
      const spinner = ora('Fetching recently played tracks...').start();

      // Perform API request
      const lists = await this._getRecentlyPlayed(token);

      // Hide spinner
      spinner.stop();

      return this._renderRecentlyPlayedList(lists);
    } catch (error) {
      console.log(error);
    }
  }

  async _getRecentlyPlayed(token) {
    try {
      // Instantiate Spotify service
      const spotify = new Spotify({ accessToken: token });

      // Fetch the list
      const response = await spotify.getRecentlyPlayed();
      const { items } = response.data;

      return items;
    } catch (error) {
      if (error && error.response && error.response.status === 401) {
        // Expired token
        const token = await this._refreshAccessTokens();

        // retry the request
        return this._getRecentlyPlayed(token);
      }
    }
  }

  async _refreshAccessTokens() {
    // instantiate spotify class
    const spotify = new Spotify({ clientId: this.clientId, clientSecret: this.clientSecret });

    // Get the refresh token
    const refreshToken = this.config.storage.get('refreshToken');

    try {
      const response = await spotify.refreshTokens(refreshToken);
      const { access_token } = response.data;

      // update the access token
      this.config.storage.set('accessToken', access_token);

      return access_token;
    } catch (error) {
      console.log('err', error);
    }
  }

  _renderRecentlyPlayedList(list) {
    // Set table header
    const table = new Table({
      head: ['Track', 'Artist', 'Duration'],
    });

    list.forEach((track) => {
      const { name: trackName, duration_ms: duration, artists: trackArtists } = track.track;

      const artists = [];

      // Get the artists as there's a possibility to have multiple artists
      trackArtists.forEach((artist) => {
        artists.push(artist.name);
      });

      const seconds = Math.floor((duration / 1000) % 60);
      const minutes = Math.floor((duration / (1000 * 60)) % 60);

      table.push([
        trackName,
        artists.join(', '),
        `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`,
      ]);
    });

    console.log(chalk.bold(`You recently played tracks.`));
    console.log(table.toString());
  }
}

module.exports = RecentlyPlayed;
