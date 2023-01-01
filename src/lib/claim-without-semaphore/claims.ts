import axios from "axios";
import { Contract } from "ethers";
import { VERIFIER_ADDRESS } from "../consts";

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
  const tx = await contract.mint(recipient, nonce, groupId, signature);
  await tx.wait();
  return true;
};

export const createGroup = async (groupId, dcntCollection, lensPubId, lensProfileId, signer) => {
  const contract = new Contract(
    VERIFIER_ADDRESS,
    [
      "function createGroup(uint256 groupId, address dcntCollection, uint256 lensPubId, uint256 lensProfileId) external",
    ],
    signer
  );
  const tx = await contract.createGroup(groupId, dcntCollection, lensPubId, lensProfileId);
  await tx.wait();
};
