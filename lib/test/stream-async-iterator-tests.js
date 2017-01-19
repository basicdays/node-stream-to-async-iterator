// @flow
import {describe, it} from 'mocha';
import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import StreamAsyncToIterator from '../stream-async-to-iterator';


describe('StreamAsyncToIterator', function() {
    const filePath = path.join(__dirname, 'lorem-ipsum.txt');

    it('should iterate on a node stream', async () => {
        const fileStream = fs.createReadStream(filePath, {encoding: 'utf8'});
        const buff: Array<string> = [];

        for await (const value of (new StreamAsyncToIterator(fileStream): StreamAsyncToIterator<string>)) {
            buff.push(value);
        }

        const content = buff.join('');
        expect(content).to.have.lengthOf(1502);
    });

    it('should iterate on a node stream with a size', async () => {
        const fileStream = fs.createReadStream(filePath, {encoding: 'utf8'});
        const buff: Array<string> = [];

        for await (const value of (new StreamAsyncToIterator(fileStream, {size: 16}): StreamAsyncToIterator<string>)) {
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
