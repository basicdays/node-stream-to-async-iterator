// @flow
import type {Readable} from 'stream';

/**
 * @type {Object.<string, Symbol>}
 */
export const states = {
    notReadable: Symbol('not readable'),
    readable: Symbol('readable'),
    ended: Symbol('ended'),
    errored: Symbol('errored'),
};

/**
 * @typedef {Object} StreamAsyncToIterator~Options
 * @property {number} [size] - the size of each read from the stream for each iteration
 */
type StreamAsyncToIteratorOptions = {
    size?: number;
}

/**
 * @typedef {Object} StreamAsyncToIterator~Iteration
 * @property {boolean} done
 * @property {*} value
 */
type Iteration = {
    done: boolean;
    value: any;
}

type Reject = (err: any) => void;

/**
 * Wraps a stream into an object that can be used as an async iterator.
 *
 * This will keep a stream in a paused state, and will only read from the stream on each
 * iteration. A size can be supplied to set an explicit call to `stream.read([size])` in
 * the options for each iteration.
 */
export default class StreamAsyncToIterator {
    /**
     * @param {Readable} stream
     * @param {StreamAsyncToIterator~Options} [options]
     */
    constructor(stream: Readable, options: StreamAsyncToIteratorOptions={}) {
        /**
         * The underlying readable stream
         * @private
         * @type {Readable}
         */
        this._stream = stream;

        /**
         * Contains stream's error when stream has error'ed out
         * @private
         * @type {?Error}
         */
        this._error = null;

        /**
         * The current state of the iterator (not readable, readable, ended, errored)
         * @private
         * @type {Symbol}
         */
        this._state = states.notReadable;

        /**
         * @private
         * @type {?number}
         */
        this._size = options.size;

        /**
         * The rejections of promises to call when stream errors out
         * @private
         * @type {Set.<function(err: Error)>}
         */
        this._rejections = new Set();

        const handleStreamError = (err) => {
            this._error = err;
            this._state = states.errored;
            for (const reject of this._rejections) {
                reject(err);
            }
        };

        const handleStreamEnd = () => {
            this._state = states.ended;
        };

        stream.once('error', handleStreamError);
        stream.once('end', handleStreamEnd);
    }

    _stream: Readable;
    _error: ?Error;
    _state: Symbol;
    _size: ?number;
    _rejections: Set<Reject>;

    /**
     * Returns the next iteration of data. Rejects if the stream errored out.
     * @returns {Promise<StreamAsyncToIterator~Iteration>}
     */
    async next(): Promise<Iteration> {
        if (this._state === states.notReadable) {
            //need to wait until the stream is readable or ended
            await Promise.race([this._untilReadable(), this._untilEnd()]);
            return this.next();
        } else if (this._state === states.ended) {
            return {done: true, value: null};
        } else if (this._state === states.errored) {
            throw this._error;
        } else /* readable */ {
            //stream.read returns null if not readable or when stream has ended

            const data = this._size ? this._stream.read(this._size) : this._stream.read();

            if (data !== null) {
                return {done: false, value: data};
            } else {
                //we're no longer readable, need to find out what state we're in
                this._state = states.notReadable;
                return this.next();
            }
        }
    }

    /**
     * Waits until the stream is readable. Rejects if the stream errored out.
     * @private
     * @returns {Promise}
     */
    _untilReadable(): Promise<void> {
        return new Promise((resolve, reject) => {
            const handleReadable = () => {
                this._state = states.readable;
                this._rejections.delete(reject);
                resolve();
            };

            this._stream.once('readable', handleReadable);
            this._rejections.add(reject);
        });
    }

    /**
     * Waits until the stream is ended. Rejects if the stream errored out.
     * @private
     * @returns {Promise}
     */
    _untilEnd(): Promise<void> {
        return new Promise((resolve, reject) => {
            const handleEnd = () => {
                this._state = states.ended;
                this._rejections.delete(reject);
                resolve();
            };
            this._stream.once('end', handleEnd);
            this._rejections.add(reject);
        })
    }
}

Object.defineProperty(StreamAsyncToIterator.prototype, (Symbol: any).asyncIterator, {
    configurable: true,
    value: function() {return this;}
});
