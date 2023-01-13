import * as PushAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";

// the private key of the address which you used to create a channel
const PK = process.env.PUSH_KEY;
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

export const sendNotification = async (link: string, title?: string, body?: string) => {
  // apiResponse?.status === 204, if sent successfully!
  await PushAPI.payloads.sendNotification({
    signer,
    type: 1, // broadcast
    identityType: 2, // direct payload
    notification: {
      title: `Club Space:`,
      body: `Starting now!`,
    },
    payload: {
      title: title ?? `Club Space is starting`,
      body: body ?? `Head over now!`,
      cta: link,
      img: "",
    },
    channel: "eip155:1:0xD1CCfb9Fbd9A8DE0cf9950eFbCFb29adcDA81C93", // your channel address
    env: "prod",
  });
};
