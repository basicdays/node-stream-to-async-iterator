import { Readable } from "stream";

const NOT_READABLE: unique symbol = Symbol("not readable");
const READABLE: unique symbol = Symbol("readable");
const ENDED: unique symbol = Symbol("ended");
const ERRORED: unique symbol = Symbol("errored");
const STATES = {
    notReadable: NOT_READABLE,
    readable: READABLE,
    ended: ENDED,
    errored: ERRORED,
} as const;
type States = typeof STATES[keyof typeof STATES];

/*
 * A contract for a promise that requires a clean up
 * function be called after the promise finishes.
 */
type PromiseWithCleanUp<T> = {
    promise: Promise<T>;
    cleanup: () => void;
};

export type StreamToAsyncIteratorOptions = {
    /** The size of each read from the stream for each iteration */
    size?: number;
};

/**
 * Wraps a stream into an object that can be used as an async iterator.
 *
 * This will keep a stream in a paused state, and will only read from the stream on each
 * iteration. A size can be supplied to set an explicit call to `stream.read([size])` in
 * the options for each iteration.
 */
export default class StreamToAsyncIterator<T = unknown>
    implements AsyncIterableIterator<T>
{
    /** The underlying readable stream */
    private _stream: Readable;
    /** Contains stream's error when stream has error'ed out */
    private _error: Error | undefined;
    /** The current state of the iterator (not readable, readable, ended, errored) */
    private _state: States = STATES.notReadable;
    private _size: number | undefined;
    /** The rejections of promises to call when stream errors out */
    private _rejections: Set<(err: Error) => void> = new Set();

    constructor(stream: Readable, { size }: StreamToAsyncIteratorOptions = {}) {
        this._stream = stream;
        this._size = size;

        const handleStreamError = (err: Error) => {
            this._error = err;
            this._state = STATES.errored;
            for (const reject of this._rejections) {
                reject(err);
            }
        };

        const handleStreamEnd = () => {
            this._state = STATES.ended;
        };

        stream.once("error", handleStreamError);
        stream.once("end", handleStreamEnd);
    }

    [Symbol.asyncIterator]() {
        return this;
    }

    /**
     * Returns the next iteration of data. Rejects if the stream errored out.
     */
    async next(): Promise<IteratorResult<T, void>> {
        switch (this._state) {
            case STATES.notReadable: {
                const read = this._untilReadable();
                const end = this._untilEnd();

                //need to wait until the stream is readable or ended
                try {
                    await Promise.race([read.promise, end.promise]);
                    return this.next();
                } finally {
                    //need to clean up any hanging event listeners
                    read.cleanup();
                    end.cleanup();
                }
            }
            case STATES.ended: {
                return { done: true, value: undefined };
            }
            case STATES.errored: {
                throw this._error;
            }
            case STATES.readable: {
                //stream.read returns null if not readable or when stream has ended

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const data: T = this._size
                    ? this._stream.read(this._size)
                    : this._stream.read();

                if (data !== null) {
                    return { done: false, value: data };
                } else {
                    //we're no longer readable, need to find out what state we're in
                    this._state = STATES.notReadable;
                    // todo: COMPLETE hack, need to find a better way to wait for readable
                    //       state is ping ponging between read and notreadable too fast
                    await new Promise((resolve) => {
                        setTimeout(resolve, 250);
                    });
                    return this.next();
                }
            }
        }
    }

    /**
     * Waits until the stream is readable. Rejects if the stream errored out.
     * @returns Promise when stream is readable
     */
    private _untilReadable(): PromiseWithCleanUp<void> {
        //let is used here instead of const because the exact reference is
        //required to remove it, this is why it is not a curried function that
        //accepts resolve & reject as parameters.
        let eventListener: (() => void) | undefined = undefined;

        const promise = new Promise<void>((resolve, reject) => {
            eventListener = () => {
                this._state = STATES.readable;
                this._rejections.delete(reject);

                // we set this to undefined to info the clean up not to do anything
                eventListener = undefined;
                resolve();
            };

            //on is used here instead of once, because
            //the listener is remove afterwards anyways.
            this._stream.once("readable", eventListener);
            this._rejections.add(reject);
        });

        const cleanup = () => {
            if (eventListener == null) return;
            this._stream.removeListener("readable", eventListener);
        };

        return { cleanup, promise };
    }

    /**
     * Waits until the stream is ended. Rejects if the stream errored out.
     * @returns Promise when stream is finished
     */
    private _untilEnd(): PromiseWithCleanUp<void> {
        let eventListener: (() => void) | undefined = undefined;

        const promise = new Promise<void>((resolve, reject) => {
            eventListener = () => {
                this._state = STATES.ended;
                this._rejections.delete(reject);

                eventListener = undefined;
                resolve();
            };

            this._stream.once("end", eventListener);
            this._rejections.add(reject);
        });

        const cleanup = () => {
            if (eventListener == null) return;
            this._stream.removeListener("end", eventListener);
        };

        return { cleanup, promise };
    }
}
