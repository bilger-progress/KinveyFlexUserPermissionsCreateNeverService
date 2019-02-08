"use-strict"

// External dependencies.
const kinveyFlexSDK = require("kinvey-flex-sdk");
const requestPromise = require("request-promise");

// Service version.
const { version: serviceVersion } = require("./package.json");

// Set-up the Flex service.
kinveyFlexSDK.service((err, flex) => {
    // Handle any errors with registration.
    if (err) {
        console.log("Error while initializing Flex!");
        return;
    }
    // Register Flex function.
    flex.functions.register("registerUser", (context, complete, modules) => {
        return requestPromise({
            method: "POST",
            uri: "https://" + context.headers.host + "/user/" + modules.backendContext.getAppKey() + "/",
            body: {
                username: context.body.username,
                password: context.body.password,
                masterSecret: modules.backendContext.getMasterSecret()
            },
            json: true,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + Buffer.from(modules.backendContext.getAppKey()
                    + ":" + modules.backendContext.getAppSecret()).toString("base64")
            }
        }).then((data) => {
            return complete().setBody({
                success: "true",
                serviceVersion: serviceVersion,
                user: data
            }).ok().next();
        }).catch((error) => {
            // Do NOT return full error object, since it contains the request body!
            return complete().setBody({
                success: false,
                serviceVersion: serviceVersion,
                error: error.error
            }).runtimeError().done();
        });
    });
});