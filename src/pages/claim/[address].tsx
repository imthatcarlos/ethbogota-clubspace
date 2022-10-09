// import { useSubscription, useClient } from "streamr-client-react";
import ClaimGoodyBag from "@/components/ClaimGoodyBag";
import { STREAMR_PUBLIC_ID } from "@/lib/consts";
import { contract } from "@/lib/semaphore/semaphore";
import redisClient from "@/lib/utils/redisClient";
import { PrivyClient } from "@privy-io/privy-node";
import { getAddress } from "ethers/lib/utils";
import { groupBy } from "lodash/collection";
import { isEmpty } from "lodash/lang";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useProvider } from "wagmi";

const ClaimsPage = ({ clubSpaceObject }) => {
  const {
    query: { address: queryAddress },
    push,
  } = useRouter();
  const { isConnected, address } = useAccount();

  return (
    <>
      <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">Your Claims</h2>
      {clubSpaceObject.map((groupId) => {
        <>
          <p>Club Space {groupId}</p>
          <ClaimGoodyBag groupId={groupId} />
        </>;
      })}
    </>
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
    const groups = await contract.queryFilter(contract.filters.GroupCreated());
    let clubSpaceObject = [];

    // check group ids in privy for attendance
    groups.forEach(async (group) => {
      const groupId = group.args[0].toString();
      console.log(groupId)
      try {
        const record = await client.get(checkSummed, groupId);
        console.log(record);
        if (record) {
          clubSpaceObject.push(groupId);
        }
      } catch {
        console.log("field not found");
      }
    });

    // return those in props

    return { props: { clubSpaceObject } };
  } catch (error) {
    console.log(error);
  }

  return { props: {} };
};
