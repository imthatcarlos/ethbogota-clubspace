import * as PushAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";

// the private key of the address which you used to create a channel
const PK = process.env.PUSH_KEY;
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

export const sendNotification = async (link) => {
  // apiResponse?.status === 204, if sent successfully!
  const apiResponse = await PushAPI.payloads.sendNotification({
    signer,
    type: 1, // broadcast
    identityType: 2, // direct payload
    notification: {
      title: `[SDK-TEST] Club Space:`,
      body: `[sdk-test] Starting now!`,
    },
    payload: {
      title: `[sdk-test] Club Space is starting`,
      body: `Head over now!`,
      cta: link,
      img: "",
    },
    channel: "eip155:5:0xD1CCfb9Fbd9A8DE0cf9950eFbCFb29adcDA81C93", // your channel address
    env: "staging",
  });
};
