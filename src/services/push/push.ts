import EpnsSDK from "@epnsproject/backend-sdk-staging"; // for testing or development.

// the private key of the address which you used to create a channel
const CHANNEL_PK = process.env.PUSH_KEY;

// Initialise the SDK
const epnsSdk = new EpnsSDK(CHANNEL_PK);

export const sendNotification = async (link) => {
  const tx = await epnsSdk.sendNotification(
    "0xD1CCfb9Fbd9A8DE0cf9950eFbCFb29adcDA81C93",
    "Club Space",
    `Starting now!`,
    "Club Space is starting",
    "Head over now!",
    3, //this is the notificationType
    link, // a url for users to be redirected to
    "", // an image url, or an empty string
    null //this can be left as null
  );
};
