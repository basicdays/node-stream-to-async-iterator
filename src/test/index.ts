import "source-map-support/register";

process.on("unhandledRejection", (reason) => {
    let message = "Unknown error";
    if (reason instanceof Error) {
        message = reason.stack ? reason.stack : reason.toString();
    }
    //eslint-disable-next-line no-console
    console.error("Unhandled rejection promise\n", message);
});
