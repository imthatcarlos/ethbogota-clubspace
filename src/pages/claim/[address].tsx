import ClaimGoodyBag from "@/components/ClaimGoodyBag";
import { getCurrentContentsData } from "@/lib/utils/privyClient";
import { GetServerSideProps } from "next";

const ClaimsPage = ({ clubSpaceObject }) => {
  return (
    <div className="mt-12 ml-12 full-height-page">
      <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">Your Claims</h2>
      {clubSpaceObject.length === 0 ? (
        <div className="mt-4">No claims for this address</div>
      ) : (
        clubSpaceObject.map((object) => (
          <div key={object.groupId} className="mt-4">
            <p className="underline mb-2">Space ID: {object.groupId}</p>
            <ClaimGoodyBag attendanceProps={object} />
          </div>
        ))
      )}
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
