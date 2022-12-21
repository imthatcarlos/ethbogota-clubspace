import { VERIFIER_ADDRESS, JSON_RPC_URL_ALCHEMY } from "@/lib/consts";
import { Contract, providers, utils, Wallet } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import contractAbi from "../../../lib/semaphore/abi.json";
import { getCurrentContentsData, updateField } from "@/lib/utils/privyClient";

const provider = new providers.JsonRpcProvider(JSON_RPC_URL_ALCHEMY);
const signer = new Wallet(process.env.ADMIN_KEY, provider);
const contract = new Contract(VERIFIER_ADDRESS, contractAbi, signer);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { groupId, recipient, signal, merkleRoot, nullifierHash, solidityProof, connectedAddress } = req.body;
  try {
    if (recipient !== connectedAddress) {
      console.log("sending claim tx");
      const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();
      const transaction = await contract.claim(groupId, recipient, signal, merkleRoot, nullifierHash, solidityProof, {
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasLimit: 2100000,
      });
      console.log(transaction.hash);
      await transaction.wait();
    }

    // TODO: make a call to privy to mark this username/groupId as claimed
    let clubSpaceObject = await getCurrentContentsData(connectedAddress, "clubspace-attendance", false);
    const index = clubSpaceObject.findIndex((x) => x.groupId.toString() === groupId.toString());
    clubSpaceObject[index].claimed = true;
    await updateField(connectedAddress, "clubspace-attendance", clubSpaceObject);

    res.status(200).end();
  } catch (error: any) {
    console.error(error);

    res.status(500).end();
  }
};

export default handler;
