const chalk = require('chalk');

const { log } = console;

// Actions
const Auth = require('./auth');

// Services
const Configuration = require('../services/configuration');

class Config {
  constructor() {
    this.configuration = new Configuration();
    this.auth = new Auth();
  }

  async execute(args) {
    const { clientId, clientSecret } = args;

    // Tell the user what we're going to do
    log(chalk.blue('Storing credentials...'));

    // Let's store the credentials
    this.storeCredentials(clientId, clientSecret);

    // Notify the user
    log(chalk.green('Credentials stored!'));

    // TODO: Ask user if it wants to login

    return this.auth.process();
  }

  storeCredentials(clientId, clientSecret) {
    this.configuration.store('clientId', clientId);
    this.configuration.store('clientSecret', clientSecret);
  }
}

module.exports = Config;
