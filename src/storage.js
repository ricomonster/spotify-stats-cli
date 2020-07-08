const fs = require('fs');

class Storage {
  constructor(opts) {
    this.file = opts.file;
  }

  get() {
    const file = this._generateFilename();

    return new Promise((resolve) => {
      fs.stat(file, (err) => {
        if (err) {
          return resolve([]);
        }

        const raw = fs.readFileSync(file);
        return resolve(JSON.parse(raw));
      });
    });
  }

  store(data) {
    this._createStorageDirectory();

    const file = this._generateFilename();
    return fs.writeFileSync(file, JSON.stringify(data));
  }

  _createStorageDirectory() {
    const directoryPath = [__dirname, 'storage'].join('/');

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    return true;
  }

  _generateFilename() {
    if (!this.file) {
      throw new Error('File missing');
    }

    return [
      process.cwd(),
      'storage',
      this.file.indexOf('.json') === -1 ? `${this.file}.json` : this.file,
    ].join('/');
  }
}

module.exports = Storage;
