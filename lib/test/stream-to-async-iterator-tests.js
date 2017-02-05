// @flow
import {describe, it} from 'mocha';
import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import S2A from '../stream-to-async-iterator';


describe('StreamAsyncToIterator', () => {
    const filePath = path.join(__dirname, 'lorem-ipsum.txt');

    it('should iterate on a node stream', async () => {
        const fileStream = fs.createReadStream(filePath, {encoding: 'utf8'});
        const buff: Array<string> = [];

        for await (const value of (new S2A(fileStream): S2A<string>)) {
            buff.push(value);
        }

        const content = buff.join('');
        expect(content).to.have.lengthOf(1502);
    });

    it('should iterate on a node stream with a size', async () => {
        const fileStream = fs.createReadStream(filePath, {encoding: 'utf8'});
        const buff: Array<string> = [];

        for await (const value of (new S2A(fileStream, {size: 16}): S2A<string>)) {
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
