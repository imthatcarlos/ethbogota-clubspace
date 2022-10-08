import { contract } from '@/lib/semaphore/semaphore'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { groupId, uri, lensPubId, lensProfileId } = req.body

    try {
        const transaction = await contract.createGroup(groupId, uri, lensPubId, lensProfileId)

        await transaction.wait()

        res.status(200).end()
    } catch (error: any) {
        console.error(error)

        res.status(500).end()
    }
}

export default handler
