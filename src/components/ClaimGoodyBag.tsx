import { useState } from "react";
import { useAccount } from "wagmi";
import ClaimFavorModal from "./ClaimFavorModal";

const ClaimGoodyBag = ({ attendanceProps }) => {
  const { groupId, claimed } = attendanceProps;
  const { address } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mb-4">
      {claimed ? <div>Party favor claimed for this space already</div> : <p>You've got a reward!</p>}
      <button
        className="flex w-36 mt-4 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={() => setModalOpen(true)}
      >
        {claimed ? "View" : "Claim Reward"}
      </button>
      {modalOpen && (
        <ClaimFavorModal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          semGroupIdHex={groupId}
          address={address}
          isClaimed={claimed}
        />
      )}
    </div>
  );
};

export default ClaimGoodyBag;
