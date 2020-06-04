require('dotenv').config();

const Login = require('./login');
const Songs = require('./songs');

const usage = () => {
  const usageText = `
  Spotify Stats CLI.

  usage:
    spotify-stats-cli <command>

    commands can be:

    login:      in order to retrieve the songs/artists you need to login first
    songs:      returns your top 50 songs
    artists:    returns your top 50 artists
    help:       used to print the usage guide

  options:
    this will be only applicable or the songs and artists command

    --4weeks    default option. fetches the stats approx. the last 4 weeks
    --6months   fetches the stats approx. the last 6 months
    --alltime   fetches the stats all time if possibly.
  `;

  console.log(usageText);
};

const cli = (args) => {
  switch (args[2]) {
    case 'login':
      const login = new Login();
      return login.process();

    case 'songs':
      const songs = new Songs();
      return songs.process({ range: args[3] ? args[3] : '' });

    case 'artist':
      console.log('artist');
      break;

    case 'help':
      usage();
      break;

    default:
      usage();
      break;
  }
};

module.exports = cli;
