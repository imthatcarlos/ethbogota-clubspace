import ClaimGoodyBag from "@/components/ClaimGoodyBag";
import { getCurrentContentsData } from "@/lib/utils/privyClient";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import axios from "axios";
import { utils } from "ethers";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const ClaimsPage = ({ clubSpaceObject }) => {
  const { address } = useAccount();
  const {
    query: { address: addressFromQuery },
  } = useRouter();
  const [hostedSpaces, setHostedSpaces] = useState([]);
  const { data: profilesResponse } = useGetProfilesOwned({}, address);
  const defaultProfile = profilesResponse ? profilesResponse.defaultProfile : null;

  useEffect(() => {
    const getHostedSpaces = async () => {
      const { data } = await axios.get(`/api/mongo/hosted-spaces?handle=${defaultProfile.handle}`);
      setHostedSpaces(data);
    };
    if (defaultProfile) {
      getHostedSpaces();
    }
  }, [address, defaultProfile]);

  if (address !== addressFromQuery) {
    return (
      <div className="mt-12 ml-12 full-height-page">
        <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">Not Authorized</h2>
        <p>This page is only accessible to the account owner</p>
      </div>
    );
  }

  return (
    <div className="mt-12 ml-12 full-height-page">
      <img
        src={defaultProfile?.picture?.original.url ?? "/anon.png"}
        width="180"
        height="180"
        className=" rounded-xl"
      />
      <h2 className="text-md font-bold tracking-tight text-xl mb-8 mt-4">{defaultProfile?.handle ?? address}</h2>
      <hr />
      <div className="grid-profile">
        <div>
          <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">Your Hosted Spaces</h2>
          {hostedSpaces.length === 0 ? (
            <div className="mt-4">No reports found for this address</div>
          ) : (
            hostedSpaces.map((space) => (
              <div key={space.id} className="mt-4 mb-8">
                <p className="underline mb-2">Space ID: {`0x` + space.clubspaceId}</p>
                <p className="mb-2">Started: {new Date(space.createdAt * 1000).toString()}</p>
                <p className="mb-2">Ended: {new Date((space.createdAt + space.length) * 1000).toString()}</p>
                <p className="mb-2">Attendees: {Object.keys(space.guests).length}</p>
                <p className="mb-2">Promoted Drop: {space.decentContract.address}</p>
                <p className="mb-2">
                  Total Sales: {utils.formatEther(space.totalSales).toString()}{" "}
                  {space.decentContract.chainId === 137 ? "MATIC" : "ETH"}
                </p>
                <p className="mb-2">Total Party Favor Claims: {space.totalClaims}</p>
              </div>
            ))
          )}
        </div>
        <div>
          <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">Your Party Favor Claims</h2>
          {clubSpaceObject.length === 0 ? (
            <div className="mt-4">No claims for this address</div>
          ) : (
            clubSpaceObject.map((object, i) => (
              <div key={i} className="mt-4 mb-8">
                <p className="underline mb-2">Space ID: {object.groupId}</p>
                <ClaimGoodyBag attendanceProps={object} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { address },
  } = context;

  try {
    const clubSpaceObject = await getCurrentContentsData(address as string, "clubspace-attendance");
    return { props: { clubSpaceObject: clubSpaceObject.reverse() } };
  } catch (error) {
    console.log(error);
  }

  return { props: {} };
};
