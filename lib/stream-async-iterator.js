/**
 * @type {Object.<string, symbol>}
 */
export const states = {
    notReadable: Symbol('not readable'),
    readable: Symbol('readable'),
    ended: Symbol('ended'),
    errored: Symbol('errored'),
};

/**
 * Wraps a stream into an object that can be used as an async iterator.
 *
 * This will keep a stream in a paused state, and will only read from the stream on each
 * iteration. A size can be supplied to set an explicit call to `stream.read([size])` in
 * the options for each iteration.
 */
export default class StreamAsyncIterator {

    /**
     * @typedef {Object} StreamAsyncIterator~Iteration
     * @property {boolean} done
     * @property {*} value
     */
    /**
     * @typedef {Object} StreamAsyncIterator~Options
     * @property {?number} [size=null] - the size of each read from the stream for each iteration
     */

    /**
     * @param {Readable} stream
     * @param {StreamAsyncIterator~Options} [options]
     */
    constructor(stream, options) {
        options = Object.assign({
            size: null,
        }, options);

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
         * @type {symbol}
         */
        this._state = states.notReadable;

        /**
         * Size of each read from stream for each iteration
         * @private
         * @type {?number}
         */
        this._size = options.size;

        /**
         * The rejections of promises to call when stream errors out
         * @private
         * @type {Set.<function>}
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

    /**
     * Returns the next iteration of data. Rejects if the stream errored out.
     * @returns {Promise<StreamAsyncIterator~Iteration>}
     */
    async next() {
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
            const data = this._stream.read(this._size);

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
    _untilReadable() {
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
    _untilEnd() {
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
if (typeof Symbol.asyncIterator === 'symbol') {
    Object.defineProperty(StreamAsyncIterator.prototype, Symbol.asyncIterator, {
        configurable: true,
        value: function() { return this; }
    });
}
