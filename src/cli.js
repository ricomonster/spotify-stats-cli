const minimist = require('minimist');

const Config = require('./actions/config');
const Login = require('./actions/login');
const Stats = require('./actions/stats');
const RecentlyPlayed = require('./actions/recently-played');

const usage = () => {
  const usageText = `
  Spotify Stats CLI.

  usage:
    spotify-stats [command] <options>

  commands can be:

    login             in order to retrieve the songs/artists you need to login first
    songs             returns your top 50 songs
    artists           returns your top 50 artists
    config            set your Spotify Client ID and Client Secret.
    recently-played   shows your recently played tracks.

  options:
    --help            show help
  `;

  console.log(usageText);
};

const cli = (args) => {
  const argv = minimist(args);

  switch (argv._[2]) {
    case 'config':
      const config = new Config();
      return config.process(argv);

    case 'login':
      const login = new Login();
      return login.process();

    case 'songs':
      const songs = new Stats({ type: 'tracks' });
      return songs.process(argv);

    case 'artists':
      const artists = new Stats({ type: 'artists' });
      return artists.process(argv);

    case 'recently-played':
      const recentlyPlayed = new RecentlyPlayed();
      return recentlyPlayed.process();

    case 'help':
    default:
      usage();
      break;
  }
};

module.exports = cli;
