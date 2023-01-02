import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { claimReward } from "@/lib/claim-without-semaphore/claims";

const ClaimFavorModal = ({ isOpen, setIsOpen }) => {
  const [loading, setLoading] = useState<boolean>();

  function closeModal() {
    setIsOpen(false);
  }

  const submit = async () => {
    setLoading(true);
    try {
      await claimReward(clubSpaceObject.semGroupIdHex, address, signer);
      setClaimable(FavorStatus.CLAIMED);
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
                  className="text-lg font-medium leading-6 text-gray-100 border-b-[1px] border-b-gray-600 pb-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Claim Party Favor</span>
                    <span className="text-gray-500 text-sm">stuff</span>
                  </div>
                </Dialog.Title>

                <form className="step-form" onSubmit={submit}>
                  <button>Claim</button>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ClaimFavorModal;
