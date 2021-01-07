const chalk = require('chalk');
const log = console.log;

// Actions
const Auth = require('./auth');

// Services
const Storage = require('./../services/storage');
class Config {
  constructor() {
    this.storage = new Storage();
    this.auth = new Auth();
  }

  async execute(args) {
    const { clientId, clientSecret } = args;

    try {
      // Tell the user what we're going to do
      log(chalk.blue('Storing credentials...'));

      // Let's store the credentials
      this.storeCredentials(clientId, clientSecret);

      // Notify the user
      log(chalk.green('Credentials stored!'));

      // TODO: Ask user if it wants to login

      return this.auth.process();
    } catch (error) {
      console.error(error);
    }
  }

  storeCredentials(clientId, clientSecret) {
    this.storage.store('clientId', clientId);
    this.storage.store('clientSecret', clientSecret);
  }
}

module.exports = Config;
