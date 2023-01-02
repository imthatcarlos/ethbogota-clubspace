import { VERIFIER_ADDRESS, JSON_RPC_URL_POKT } from "@/lib/consts";
import { getCurrentContentsData } from "@/lib/utils/privyClient";
import { Contract, providers, utils, Wallet } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

const provider = new providers.JsonRpcProvider(JSON_RPC_URL_POKT);
const signer = new Wallet(process.env.ADMIN_KEY, provider);
const contract = new Contract(VERIFIER_ADDRESS, ["event NonceUsed(uint256 indexed nonce)"], signer);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { groupId, recipient, address } = req.body;

  try {
    // verify recipient and groupId with privy call
    const clubSpaceObject = await getCurrentContentsData(address as string, "clubspace-attendance");
    const record = clubSpaceObject.find(e => e.groupId === groupId)
    if (!record) {
      throw "groupId not found in clubSpaceObject";
    } else if (record.claimed) {
      throw "groupId already claimed";
    }
    
    // create signature
    const nonceFilter = contract.filters.NonceUsed();
    const events = await contract.queryFilter(nonceFilter, -100000);
    const nonce = events.length === 0 ? 0 : events[events.length - 1].args[0].add(1);

    const message = utils.defaultAbiCoder.encode(
      ["address", "address", "uint256"],
      [VERIFIER_ADDRESS, recipient, nonce]
    );
    const hash = utils.keccak256(message);
    const signature = await signer.signMessage(utils.arrayify(hash));

    res.json({ signature, nonce });
  } catch (error: any) {
    console.error(error);

    res.status(500).end();
  }
};

export default handler;
