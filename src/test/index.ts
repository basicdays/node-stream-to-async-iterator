import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import "source-map-support/register";

chai.use(chaiAsPromised);

process.on("unhandledRejection", (reason) => {
    let message = "Unknown error";
    if (reason instanceof Error) {
        message = reason.stack ? reason.stack : reason.toString();
    }
    //eslint-disable-next-line no-console
    console.error("Unhandled rejection promise\n", message);
});
