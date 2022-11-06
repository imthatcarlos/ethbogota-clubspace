import { useIdentity } from "@/hooks/identity";
import { createGroup, joinGroup } from "@/lib/semaphore/semaphore";
import { LensHubProxy } from "@/services/lens/abi";
import { LENSHUB_PROXY } from "@/services/lens/gaslessTxs";
import { useAccount, useContract, useSigner } from "wagmi";

const Test = ({ defaultProfile }) => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { identity } = useIdentity();

  const contract = useContract({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    signerOrProvider: signer,
  });

  const doTest = async () => {
    const groupId = "0x1234567891234";
    const pubCount = await contract.getPubCount(defaultProfile.id);
    const lensPubId = pubCount.toHexString();

    await createGroup(groupId, "ipfs://QmQmUMbVnARrz1M9XswLeh8vzsGmdZPASXdYWhiNao9hSe", lensPubId, defaultProfile.id);
    await joinGroup(defaultProfile.handle, identity, groupId, address);
  };
  return <button onClick={doTest}>Test it </button>;
};

export default Test;
