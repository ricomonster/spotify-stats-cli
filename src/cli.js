const { program } = require('commander');

// Actions
const Config = require('./actions/config');
const Stats = require('./actions/stats');

// Utils
const render = require('./utils/render');
const Sort = require('./utils/sort');

const { error: errorLog } = console;

const cli = () => {
  program.version('1.1.0').description('Spotify Stats CLI.');

  // Build out the commands
  // Config Command
  program
    .command('config')
    .description('set your Spotify Client ID and Client Secret.')
    .requiredOption('--clientId <clientId>', 'sets or shows the Client ID.')
    .requiredOption('--clientSecret <clientSecret>', 'sets or shows the Client Secret.')
    .action(async (cmd) => {
      const config = new Config();
      await config.execute({
        clientId: cmd.clientId,
        clientSecret: cmd.clientSecret,
      });
    });

  // Artists Stats Command
  program
    .command('artists')
    .description('returns your top 50 artists.')
    .option('--last4weeks', 'fetches the stats approx. the last 4 weeks.')
    .option('--last6months', 'fetches the stats approx. the last 6 months.')
    .option('--alltime', 'fetches the stats all time if possibly.')
    .action(async (cmd) => {
      let timeline = 'short_term';

      // Determine the timeline of the stats that we're going to fetch.
      if (cmd.last6months) {
        timeline = 'medium_term';
      }

      if (cmd.alltime) {
        timeline = 'long_term';
      }

      // Instantiate and execute
      const stats = new Stats();
      try {
        // Fetch the lists
        let statList = await stats.execute({ type: 'artists', timeline });

        // Before we store the list, let's tidy up first.
        // We need to compare the incoming list vs. to the stored ones and
        // update the rankings
        const sort = new Sort();
        statList = await sort.stats(statList, { type: 'artists', timeline });

        // Render
        return render({ data: statList, type: 'artists', timeline });
      } catch (error) {
        errorLog(error);
        return false;
      }
    });

  // Track Stats Command
  program
    .command('tracks')
    .description('returns your top 50 tracks/songs.')
    .option('--last4weeks', 'fetches the stats approx. the last 4 weeks.')
    .option('--last6months', 'fetches the stats approx. the last 6 months.')
    .option('--alltime', 'fetches the stats all time if possibly.')
    .action(async (cmd) => {
      let timeline = 'short_term';

      // Determine the timeline of the stats that we're going to fetch.
      if (cmd.last6months) {
        timeline = 'medium_term';
      }

      if (cmd.alltime) {
        timeline = 'long_term';
      }

      // Instantiate and execute
      const stats = new Stats();
      try {
        // Fetch the lists
        let statList = await stats.execute({ type: 'tracks', timeline });

        // Before we store the list, let's tidy up first.
        // We need to compare the incoming list vs. to the stored ones and
        // update the rankings
        const sort = new Sort();
        statList = await sort.stats(statList, { type: 'tracks', timeline });

        // Render
        return render({ data: statList, type: 'tracks', timeline });
      } catch (error) {
        errorLog(error);
        return false;
      }
    });

  program.parseAsync(process.argv);
};

module.exports = cli;
