import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { DECENT_HQ_API } from '@/services/decent/utils';

const getContractsFor = async (address: string) => {
  try {
     const { data } = await axios.get(`${DECENT_HQ_API}/getDeployedContracts/${address}`);

     return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: 'missing param: address' });

    const data = await getContractsFor(address);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
}

export default handler
