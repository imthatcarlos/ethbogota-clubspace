// import { useSubscription, useClient } from "streamr-client-react";
import ClaimGoodyBag from "@/components/ClaimGoodyBag";
import { contract } from "@/lib/semaphore/semaphore";
import { PrivyClient } from "@privy-io/privy-node";
import { getAddress } from "ethers/lib/utils";
import { GetServerSideProps } from "next";

const ClaimsPage = ({ clubSpaceObject }) => {
  return (
    <div className="mt-12 ml-12">
      <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">Your Claims</h2>
      {clubSpaceObject.map((groupId) => (
        <div key={groupId} className="mt-4">
          <p>Club Space {groupId}</p>
          <ClaimGoodyBag groupId={groupId} />
        </div>
      ))}
    </div>
  );
};

export default ClaimsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { address },
  } = context;

  const client = new PrivyClient(process.env.PRIVY_API_KEY!, process.env.PRIVY_API_SECRET!);

  const checkSummed = getAddress(address as string);

  try {
    // get groups off contract
    const groups = await contract.queryFilter(contract.filters.GroupCreated(), 28522249);
    let clubSpaceObject = [];

    // check group ids in privy for attendance
    const list = await Promise.all(groups.map((group) => client.get(checkSummed, group.args[0].toString())));

    // return those in props
    clubSpaceObject = list.flatMap((e, i) => (e === null ? [] : [groups[i].args[0].toString()]));

    return { props: { clubSpaceObject } };
  } catch (error) {
    console.log(error);
  }

  return { props: {} };
};
