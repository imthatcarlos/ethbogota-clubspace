import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { claimReward, FavorStatus } from "@/lib/claim-without-semaphore/claims";
import toast from "react-hot-toast";
import { useNetwork, useSigner } from "wagmi";
import axios from "axios";
import { getDeploymentForGroup } from "@/hooks/useGetDeployedZkEditions";

const ClaimFavorModal = ({ isOpen, setIsOpen, semGroupIdHex, address, isClaimed = undefined }) => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const [loading, setLoading] = useState<boolean>();
  const [claimable, setClaimable] = useState<FavorStatus>(FavorStatus.NOT_CLAIMABLE);
  const { data: deployedZkEdition, isLoading } = getDeploymentForGroup(semGroupIdHex, chain.id, signer);

  console.log(deployedZkEdition);

  function closeModal() {
    setIsOpen(false);
  }

  useEffect(() => {
    setLoading(true);
    if (isClaimed === undefined) {
      axios.post(`/api/privy/get-claim-status`, { groupId: semGroupIdHex, address }).then((data) => {
        const joinStatus = data.data.status;
        if (joinStatus === FavorStatus.CLAIMABLE) {
          setClaimable(FavorStatus.CLAIMABLE);
        } else if (joinStatus === FavorStatus.CLAIMED) {
          setClaimable(FavorStatus.CLAIMED);
        }
        setLoading(false);
      });
    } else {
      if (isClaimed) {
        setClaimable(FavorStatus.CLAIMED);
      } else {
        setClaimable(FavorStatus.CLAIMABLE);
      }
      setLoading(false);
    }
  }, []);

  const submit = async () => {
    setLoading(true);
    try {
      const claimed = await claimReward(semGroupIdHex, address, signer);
      if (claimed) {
        setClaimable(FavorStatus.CLAIMED);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error claiming favor");
    }
    setLoading(false);
  };

  return (
    <div className="w-full p-8 flex flex-col gap-3">
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-xl min-h-[300px] transform overflow-hidden rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-100 border-b-[1px] border-b-gray-600 pb-3 mb-2"
                >
                  <div>
                    <p className="text-gray-300">Claim Party Favor</p>
                    {loading || isLoading ? (
                      <p className="text-gray-500 text-sm">Checking...</p>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        {claimable === FavorStatus.CLAIMABLE
                          ? "Claim your party favor now!"
                          : claimable === FavorStatus.CLAIMED
                          ? "You have claimed your party favor!"
                          : "You need to stay in the party for 3 minutes to claim your party favor"}
                      </p>
                    )}
                  </div>
                </Dialog.Title>

                {isLoading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="">
                    <p className="text-xl">{deployedZkEdition?.metadata?.name}</p>
                    <img
                      src={`https://ipfs.io/ipfs/${deployedZkEdition?.imgUri?.substring(7)}`}
                      className="m-auto max-w-xs"
                    />
                    {deployedZkEdition?.description?.split("\n").map((line) => {
                      return <p className="text-md">{line}</p>;
                    })}
                  </div>
                )}

                <button disabled={claimable !== FavorStatus.CLAIMABLE || loading} onClick={submit} className="btn mt-4">
                  {isLoading || loading ? "..." : claimable === FavorStatus.CLAIMED ? "Already Claimed" : "Claim"}
                </button>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ClaimFavorModal;
