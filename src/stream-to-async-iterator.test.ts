import fs from "fs";
import path from "path";
import { Readable } from "stream";

import { expect } from "chai";

import S2A from "./stream-to-async-iterator";

describe("StreamToAsyncIterator", function () {
    const filePath = path.join(__dirname, "test/lorem-ipsum.txt");

    function assertClosed(stream: Readable, iter: S2A) {
        expect(stream).to.have.property("destroyed", true);
        expect(stream.listenerCount("readable")).to.equal(0);
        expect(stream.listenerCount("end")).to.equal(0);
        expect(stream.listenerCount("error")).to.equal(0);
        expect(iter).to.have.property("closed", true);
    }

    it("should iterate on an object mode stream", async function () {
        type Obj = { id: number };
        const data: Obj[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const objStream = Readable.from(data);
        const iter = new S2A<Obj>(objStream);
        const buff: Obj[] = [];

        for await (const value of iter) {
            buff.push(value);
        }

        assertClosed(objStream, iter);
        expect(buff).to.have.lengthOf(3);
    });

    it("should iterate on an empty stream", async function () {
        type Obj = { id: number };
        const data: Obj[] = [];
        const objStream = Readable.from(data);
        const iter = new S2A<Obj>(objStream);
        const buff: Obj[] = [];

        for await (const value of iter) {
            buff.push(value);
        }

        assertClosed(objStream, iter);
        expect(buff).to.have.lengthOf(0);
    });

    it("should handle unstable streams", async function () {
        type Obj = { id: number };
        const data: Obj[] = [];
        const objStream = Readable.from(data);
        const iter = new S2A<Obj>(objStream);
        const buff: Obj[] = [];

        objStream.read();
        for await (const value of iter) {
            buff.push(value);
        }

        assertClosed(objStream, iter);
        expect(buff).to.have.lengthOf(0);
    });

    it("should handle premature loop break", async function () {
        type Obj = { id: number };
        const data: Obj[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const objStream = Readable.from(data);
        const iter = new S2A<Obj>(objStream);
        const buff: Obj[] = [];

        let count = 0;
        for await (const value of iter) {
            if (count >= 1) {
                break;
            }
            count += 1;
            buff.push(value);
        }

        assertClosed(objStream, iter);
        expect(buff).to.have.lengthOf(1);
    });

    it("should handle stream errors", async function () {
        type Obj = { id: number };
        const data: Obj[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const objStream = Readable.from(data);
        const iter = new S2A<Obj>(objStream);
        const buff: Obj[] = [];

        const errMessage = "test throw";
        await expect(
            (async () => {
                let count = 0;
                for await (const value of iter) {
                    count += 1;
                    buff.push(value);
                    if (count >= 1) {
                        objStream.emit("error", new Error(errMessage));
                    }
                }
            })()
        ).to.eventually.be.rejectedWith(errMessage);

        assertClosed(objStream, iter);
        expect(buff).to.have.lengthOf(1);
    });

    it("should handle manual throws", async function () {
        type Obj = { id: number };
        const data: Obj[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const objStream = Readable.from(data);
        const iter = new S2A<Obj>(objStream);
        const buff: Obj[] = [];

        const errMessage = "test throw";
        await expect(
            (async () => {
                let count = 0;
                for await (const value of iter) {
                    if (count >= 1) {
                        await iter.throw(new Error(errMessage));
                    }
                    count += 1;
                    buff.push(value);
                }
            })()
        ).to.eventually.be.rejectedWith(errMessage);

        assertClosed(objStream, iter);
        expect(buff).to.have.lengthOf(1);
    });

    it("should iterate on a node stream with string encoding", async function () {
        const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
        const iter = new S2A<string>(fileStream);
        const buff: string[] = [];

        for await (const value of iter) {
            buff.push(value);
        }

        const content = buff.join("");

        assertClosed(fileStream, iter);
        expect(content).to.have.lengthOf(1502);
    });

    it("should iterate on a node stream with a size with string encoding", async function () {
        const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
        const iter = new S2A<string>(fileStream, { size: 16 });
        const buff: string[] = [];

        for await (const value of iter) {
            buff.push(value);
        }

        const content = buff.join("");

        assertClosed(fileStream, iter);
        expect(buff).to.have.lengthOf(94);
        expect(content).to.have.lengthOf(1502);
    });
});
