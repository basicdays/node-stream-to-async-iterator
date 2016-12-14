import 'source-map-support/register';
import 'babel-polyfill';
import chai from 'chai';


Error.stackTraceLimit = Infinity;
chai.should();

process.on('unhandledRejection', (reason, p) => {
   const message = reason.stack ? reason.stack : reason.toString();
   //eslint-disable-next-line no-console
   console.error('Unhandled rejection promise\n', message);
});
