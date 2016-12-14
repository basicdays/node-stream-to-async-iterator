import fs from 'fs';
import path from 'path';
import StreamAsyncIterator from '../stream-async-iterator';


describe('StreamAsyncIterator', () => {
    const filePath = path.join(__dirname, 'lorem-ipsum.txt');

    it('should iterate on a node stream', async () => {
        const fileStream = fs.createReadStream(filePath, 'utf8');
        const buff = [];

        for await (const value of new StreamAsyncIterator(fileStream)) {
            buff.push(value);
        }

        const content = buff.join('');
        content.should.have.lengthOf(1502);
    });

    it('should iterate on a node stream with a size', async () => {
        const fileStream = fs.createReadStream(filePath, 'utf8');
        const buff = [];

        for await (const value of new StreamAsyncIterator(fileStream, {size: 16})) {
            buff.push(value);
        }

        const content = buff.join('');
        buff.should.have.lengthOf(94);
        content.should.have.lengthOf(1502);
    });

    it('should clean up all stream events when stream ends');

    it('should clean up all stream events when stream errors');

    it('should handle a stream error in middle of iteration with a rejection');
});
