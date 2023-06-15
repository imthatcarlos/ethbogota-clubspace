import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function Example() {
  const [open, setOpen] = useState(true);

  const onClose = setOpen;

  return (
    <>
      <div>
        <button onClick={() => setOpen(true)}>open modal</button>
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-secondary backdrop-blur-[3px] bg-opacity-10 transition-opacity" />
          </Transition.Child>

          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end sm:items-center justify-center min-h-full lg:p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  className={`relative transform lg:px-4 md:pb-4 md:pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 rounded-sm bg-[#141414] text-[#ECE5D5] lg:min-w-[600px] w-full h-screen md:h-auto`}
                >
                  <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block z-10">
                    <button
                      type="button"
                      className="cursor-pointer focus-visible:outline-none"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close</span>X
                    </button>
                  </div>
                  <div className="flex flex-col px-8 pt-4 gap-2 space-y-8 bg-[#141414]">
                    <div
                      className="absolute inset-0 z-0 pointer-events-none"
                      style={{
                        clipPath: "ellipse(100% 30% at 33% 0%)",
                        backgroundImage: `linear-gradient(225deg, rgba(20, 20, 20, 0) 0%, rgba(228, 33, 1, 0.6) 100%), linear-gradient(225deg, rgba(228, 33, 1, 0.4) 0%, rgba(20, 20, 20, 0) 100%), linear-gradient(135deg, rgba(228, 33, 1) 0%, rgba(249, 24, 128, 0) 100%), linear-gradient(135deg, rgba(209, 26, 40, 0) 0%, rgb(209, 26, 40) 100%), linear-gradient(0deg, rgb(255, 122, 0) 0%, rgb(255, 122, 0) 100%)`,
                      }}
                    ></div>
                    <div className="z-10 flex flex-col gap-2">
                      <h1 className="text-xl font-bold">Subscribe to 🏛Architectolder</h1>
                      <p className="text-[#ECE5D5] text-opacity-90 text-sm">
                        Support your favorite people on Twitter for bonus content and extra perks.
                      </p>
                      <div className="flex gap-2 items-start">
                        <span className="bg-[#141414] w-14 h-14 rounded-[56px]"></span>
                        <div className="bg-[#141414] flex-1 p-4 shadow-lg shadow-[#ECE5D525] rounded-md rounded-tl-none">
                          Three accounts in one. @Architectolder, @RusticLiv, @Greyscalegrey1.
                        </div>
                      </div>
                    </div>
                    <div className="z-10">
                      <h2 className="font-bold text-lg">Get bonus content when you sign up</h2>
                      <p className="text-[#ECE5D5] text-opacity-90 text-sm">
                        Bonus photos and videos of US and European Art and Architecture. All subscribers will have
                        access to DMs should you need.
                      </p>
                      <div className="flex items-center justify-center">
                        <div className="bg-red-500 shadow-xl w-3/4 h-28 rounded-b-md mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Find your people and get recognized</h2>
                      <p className="text-[#ECE5D5] text-opacity-90 text-sm">
                        You’ll get a public Subscribed badge that makes it easier to get noticed, chat, and connect.
                      </p>
                      <div className="flex items-center justify-center">
                        <div className="bg-red-500 shadow-xl w-3/4 h-48 rounded-b-md mt-4"></div>
                      </div>
                    </div>
                    <div>
                      <p>
                        By clicking below to make this purchase, you agree to be bound by the Twitter Purchaser
                        Terms.Cancel anytime. Auto-renews monthly.
                      </p>
                    </div>
                    {/* SUPERFLUID WIDGET HERE */}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
