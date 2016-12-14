declare type StreamAsyncIteratorOptions = {
    size?: number;
}

declare class StreamAsyncIterator<TData> {
    constructor(stream: stream$Readable, options?: StreamAsyncIteratorOptions) : StreamAsyncIterator<TData>;
    @@iterator(): $Iterator<TData, void, void>;
    next(): IteratorResult<TData, void>;
}
