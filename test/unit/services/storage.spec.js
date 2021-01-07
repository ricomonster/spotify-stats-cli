const { expect } = require('chai');
const sinon = require('sinon');

const Storage = require('src/services/storage');

describe('Services :: Storage', () => {
  context('should work properly', () => {
    let storageClass;

    before(() => {
      storageClass = new Storage();
    });

    after(() => {
      storageClass.clear();
    });

    it('should store an item', () => {
      const result = storageClass.store('clientId', '1234567890');

      expect(result).to.be.an('object');
    });

    it('should fetch an item', () => {
      const result = storageClass.fetch('clientId');

      expect(result).to.be.equal('1234567890');
    });
  });
});
