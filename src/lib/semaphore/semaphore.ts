import { Contract, providers, utils } from "ethers";
import contractAbi from "./abi.json";

import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof";
import { VERIFIER_ADDRESS, ZK_DEPLOYMENT_BLOCK } from "../consts";
import axios from "axios";

const provider = new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_MUMBAI_URL);
export const contract = new Contract(VERIFIER_ADDRESS, contractAbi, provider);

export const createGroup = async (groupId, uri, lensPubId, lensProfileId) => {
  console.log(`Creating group...`);

  const { status } = await fetch(`/api/semaphore/create-group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, uri, lensPubId, lensProfileId }),
  });

  if (status === 200) {
    console.log(`created groupid ${groupId}`);
  } else {
    console.log("Some error occurred, please try again!");
  }
};

export const joinGroup = async (lensUsername, identity, groupId, address) => {
  console.log(`Joining the group...`, lensUsername, groupId, identity);

  const { status } = await fetch(`/api/semaphore/join-group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: identity.toString(),
      username: lensUsername,
      groupId,
      address,
    }),
  });

  if (status === 200) {
    console.log(`You joined the Club space group event 🎉 `);
  } else {
    console.log("Some error occurred, please try again!");
  }
};

export const claimReward = async (groupId, recipient, identity, connectedAddress) => {
  const {
    data: { groupIdentities },
  } = await axios.post(`/api/redis/get-group`, { groupId });

  const group = new Group();
  group.addMembers(groupIdentities);

  console.log("group created");
  const identityObject = new Identity(identity);

  const signal = utils.formatBytes32String("ClubSpace");
  const snarkPath = "https://madfinance.mypinata.cloud/ipfs/QmWwcHM63BqpmUnm2EXAKQeyjKBEnTTxHjHbihUo3pM8kU";
  const { proof, publicSignals } = await generateProof(identityObject, group, groupId.toString(), signal, {
    wasmFilePath: `${snarkPath}/semaphore.wasm`,
    zkeyFilePath: `${snarkPath}/semaphore.zkey`,
  });
  const solidityProof = packToSolidityProof(proof);

  try {
    console.log("sending tx");
    const { status } = await fetch(`/api/semaphore/claim-reward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        recipient,
        signal,
        merkleRoot: publicSignals.merkleRoot,
        nullifierHash: publicSignals.nullifierHash,
        solidityProof,
        connectedAddress,
      }),
    });

    if (status === 200) {
      console.log("success");
      return true;
    } else {
      console.log("Some error occurred, please try again!");
      return false;
    }
  } catch (error) {
    console.error(error);
    console.log("Some error occurred, please try again!");
    return false;
  }
};
