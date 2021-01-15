const { expect, assert } = require('chai');
const fs = require('fs');

const Storage = require('src/services/storage');

describe('Services :: Storage', () => {
  context('should work properly', () => {
    let storageClass;
    let fileLocation;

    before(() => {
      storageClass = new Storage('foobar.json');
    });

    it('should create a file and store it', async () => {
      const file = await storageClass.store(JSON.stringify({ test: '1234567890' }));
      fileLocation = file;
      assert.isOk(fs.existsSync(file));
    });

    it('should fetch and return the contents of the file', async () => {
      const fileContents = await storageClass.get();
      const content = JSON.parse(fileContents);

      expect(content).to.be.an('object');
      expect(content).to.have.property('test');
    });

    it('should remove or delete the file', async () => {
      await storageClass.remove();

      assert.isOk(!fs.existsSync(fileLocation));
    });
  });

  context('it should not work properly', () => {
    it('should return an error that filename is required', async () => {
      try {
        const storageClass = new Storage();
        await storageClass.store(JSON.stringify({ test: '1234567890' }));
      } catch (error) {
        expect(error.message).to.be.equal('Filename is required.');
      }
    });

    it('should return an error due to the file does not exists', async () => {
      try {
        const storageClass = new Storage('foo-bar.json');
        await storageClass.get();
      } catch (error) {
        expect(error.message).to.be.equal('File does not exists.');
      }
    });

    it('should return an error due to the file does not exists when trying to remove', async () => {
      try {
        const storageClass = new Storage('foo-bar.json');
        await storageClass.remove();
      } catch (error) {
        expect(error.message).to.be.equal('File does not exists.');
      }
    });
  });
});
