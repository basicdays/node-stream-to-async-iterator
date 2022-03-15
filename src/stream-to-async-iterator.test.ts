import fs from "fs";
import path from "path";
import { Readable } from "stream";

import { expect } from "chai";

import S2A from "./stream-to-async-iterator";

describe("StreamToAsyncIterator", function () {
    const filePath = path.join(__dirname, "test/lorem-ipsum.txt");

    it("should iterate on an object mode stream", async function () {
        type Obj = { id: number };
        const data: Obj[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const objStream = Readable.from(data);
        const buff: Obj[] = [];

        for await (const value of new S2A<Obj>(objStream)) {
            buff.push(value);
        }

        expect(buff).to.have.lengthOf(3);
    });

    it("should iterate on a node stream with string encoding", async function () {
        const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
        const buff: string[] = [];

        for await (const value of new S2A<string>(fileStream)) {
            buff.push(value);
        }

        const content = buff.join("");
        expect(content).to.have.lengthOf(1502);
    });

    it("should iterate on a node stream with a size with string encoding", async function () {
        const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
        const buff: string[] = [];

        for await (const value of new S2A<string>(fileStream, { size: 16 })) {
            buff.push(value);
        }

        const content = buff.join("");
        expect(buff).to.have.lengthOf(94);
        expect(content).to.have.lengthOf(1502);
    });

    it("should clean up all stream events when stream ends");

    it("should clean up all stream events when stream errors");

    it("should handle a stream error in middle of iteration with a rejection");
});
