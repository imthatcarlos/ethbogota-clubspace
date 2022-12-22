import { Contract, providers, utils } from "ethers";
import contractAbi from "./abi.json";

import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof";
import { VERIFIER_ADDRESS, ZK_DEPLOYMENT_BLOCK, JSON_RPC_URL_ALCHEMY } from "../consts";
import axios from "axios";

const provider = new providers.JsonRpcProvider(JSON_RPC_URL_ALCHEMY);
export const contract = new Contract(VERIFIER_ADDRESS, contractAbi, provider);

export const createGroup = async (groupId, dcntCollection, lensPubId, lensProfileId) => {
  console.log(`Creating group...`);

  const { status } = await fetch(`/api/semaphore/create-group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, dcntCollection, lensPubId, lensProfileId }),
  });

  if (status === 200) {
    console.log(`created groupid ${groupId}`);
  } else {
    console.log("Some error occurred, please try again!");
  }
};

export const joinGroup = async (lensUsername, identity, groupId, address) => {
  console.log(`Joining the group...`, lensUsername, groupId, identity);
  
  try{
    const identityString = identity.toString()
    const { status } = await fetch(`/api/semaphore/join-group`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: identityString,
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
  } catch (error) {
    console.log(error)
  }
};

export const claimReward = async (groupId, recipient, identity, connectedAddress, signer) => {
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

  // make them pay their own gas since no privacy
  if (recipient === connectedAddress && signer) {
    console.log("sending claim tx");
    try {
      const tx = await contract
        .connect(signer)
        .claim(groupId, recipient, signal, publicSignals.merkleRoot, publicSignals.nullifierHash, solidityProof, {
          gasLimit: 500_000,
        });
      await tx.wait();
    } catch (e) {
      return false;
    }
  }

  try {
    console.log("posting");
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
