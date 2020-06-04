const fs = require('fs');
const path = require('path');

class Token {
  constructor() {
    this.appDir = 'storage';
    this.accessTokenFile = 'access.json';
    this.refreshTokenFile = 'refresh.json';
  }

  store(filename, token) {
    const accessToken = JSON.stringify(token);
    const tokenFile = path.join(this.appDir, filename);

    // Write file
    fs.writeFile(tokenFile, accessToken, 'utf-8', (err) => {
      if (err) {
        return err;
      }
    });
  }

  storeAccessToken(token) {
    return this.store(this.accessTokenFile, token);
  }

  storeRefreshToken(token) {
    return this.store(this.refreshTokenFile, token);
  }

  getAccessToken() {
    return this._getToken(this.accessTokenFile);
  }

  getRefreshToken() {
    return this._getToken(this.refreshTokenFile);
  }

  _getToken(token) {
    const tokenFile = path.join(this.appDir, token);

    try {
      if (fs.existsSync(tokenFile)) {
        const content = fs.readFileSync(tokenFile, 'utf8');
        return JSON.parse(content);
      }

      return false;
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = Token;
