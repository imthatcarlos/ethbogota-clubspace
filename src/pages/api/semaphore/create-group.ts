import { VERIFIER_ADDRESS, JSON_RPC_URL_POKT } from "@/lib/consts";
import { Contract, providers, Wallet } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import contractAbi from "../../../lib/semaphore/abi.json";

const provider = new providers.JsonRpcProvider(JSON_RPC_URL_POKT);
const signer = new Wallet(process.env.ADMIN_KEY, provider);
const contract = new Contract(VERIFIER_ADDRESS, contractAbi, signer);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { groupId, dcntCollection, lensPubId, lensProfileId } = req.body

    try {
				const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await provider.getFeeData();
				console.log('creating group...');
        const transaction = await contract.createGroup(
					groupId,
					dcntCollection,
					lensPubId,
					lensProfileId,
					{ gasLimit: 2100000, gasPrice }
				)
				console.log(`tx: ${transaction.hash}`);

        await transaction.wait()

        res.status(200).end()
    } catch (error: any) {
        console.error(error)

        res.status(500).end()
    }
}

export default handler
