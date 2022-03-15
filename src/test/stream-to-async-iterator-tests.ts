// @flow
import fs from 'fs';
import path from 'path';

import chai from 'chai';
import mocha from 'mocha';

import S2A from '../stream-to-async-iterator';

const {expect} = chai;
const {describe, it} = mocha;


describe('StreamToAsyncIterator', function() {
    const filePath = path.join(__dirname, 'lorem-ipsum.txt');

    it('should iterate on a node stream with string encoding', async function() {
        const fileStream = fs.createReadStream(filePath, {encoding: 'utf8'});
        const buff: string[] = [];

        for await (const value of new S2A(fileStream)) {
            buff.push(value);
        }

        const content = buff.join('');
        expect(content).to.have.lengthOf(1502);
    });

    it('should iterate on a node stream with a size with string encoding', async function() {
        const fileStream = fs.createReadStream(filePath, {encoding: 'utf8'});
        const buff: string[] = [];

        for await (const value of new S2A(fileStream, {size: 16})) {
            buff.push(value);
        }

        const content = buff.join('');
        expect(buff).to.have.lengthOf(94);
        expect(content).to.have.lengthOf(1502);
    });

    it('should clean up all stream events when stream ends');

    it('should clean up all stream events when stream errors');

    it('should handle a stream error in middle of iteration with a rejection');
});
