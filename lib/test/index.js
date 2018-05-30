// @flow
import 'source-map-support/register';


Error.stackTraceLimit = Infinity;

process.on('unhandledRejection', (reason, p) => {
   const message = reason.stack ? reason.stack : reason.toString();
   //eslint-disable-next-line no-console
   console.error('Unhandled rejection promise\n', message);
});
