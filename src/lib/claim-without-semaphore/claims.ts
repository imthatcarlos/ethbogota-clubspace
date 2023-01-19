import axios from "axios";
import { Contract } from "ethers";
import { VERIFIER_ADDRESS } from "../consts";

export enum FavorStatus {
  NOT_CLAIMABLE = 0,
  CLAIMABLE = 1,
  CLAIMED = 2,
}

export const claimReward = async (groupId, recipient, signer) => {
  // get auth signature from server /api/semaphore/get-sig
  const address = await signer.getAddress();
  const {
    data: { signature, nonce },
  } = await axios.post(`/api/semaphore/get-sig`, { groupId, recipient, address });

  const contract = new Contract(
    VERIFIER_ADDRESS,
    ["function mint(address recipient, uint256 nonce, uint groupId, bytes memory signature) public"],
    signer
  );
  try {
    const tx = await contract.mint(recipient, nonce, groupId, signature);
    await axios.post(`/api/privy/party-favor-claimed`, { groupId, address, hash: tx.hash });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const createGroup = async (groupId, dcntCollection, lensPubId, lensProfileId, signer) => {
  const contract = new Contract(
    VERIFIER_ADDRESS,
    [
      "function createGroup(uint256 groupId, address dcntCollection, uint256 lensPubId, uint256 lensProfileId) external",
    ],
    signer
  );
  const tx = await contract.createGroup(groupId.replace(/-/g, ''), dcntCollection, lensPubId, lensProfileId);
  await tx.wait();
};

export const joinGroup = async (groupId, address) => {
  console.log(`Joining the group...`, groupId);

  try {
    const { status } = await fetch(`/api/semaphore/join-group`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
    console.log(error);
  }
};
