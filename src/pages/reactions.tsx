import { LensProfile, reactionsEntries, ReactionsTypes } from "@/components/LensProfile";
import { Fragment } from "react";
import { useState } from "react";
import { Menu, Popover, Transition } from "@headlessui/react";
import { classNames } from "@/lib/utils/classNames";

const profiles = Array.from({ length: 10 }, (_, i) => i);

const Reactions = () => {
  const [selected, setSelected] = useState<ReactionsTypes>();

  const handleReactionSelection = (key: ReactionsTypes) => {
    setSelected(key);

    setTimeout(() => {
      setSelected(undefined);
    }, 2000);
  };

  return (
    <div className="w-full h-screen grid place-items-center">
      <div className="w-full border border-grey-700 shadow-xl flex flex-wrap gap-6 p-8 rounded-sm relative">
        {profiles.map((profile) => (
          <LensProfile
            key={profile}
            handle="handle"
            picture="https://avatar.tobi.sh/0x33FE1E3712161B1fd43803B682eE73de80Dc8544_thereisnosecondbest.png"
            reaction={selected}
          />
        ))}
        <Popover
          className={({ open }) =>
            classNames(
              open ? "fixed inset-0 z-40 overflow-y-auto" : "",
              "shadow-sm lg:static bottom-0 lg:overflow-y-visible"
            )
          }
        >
          {({ open }) => (
            <>
              <Menu as="div" className="relative flex-shrink-0">
                <div>
                  <Menu.Button className="btn">react</Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none flex gap-4 flex-wrap">
                    {reactionsEntries.map(([key, value]) => (
                      <Menu.Item key={value}>
                        {({ active }) => (
                          <button onClick={() => handleReactionSelection(key as ReactionsTypes)}>{value}</button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>

              <Popover.Panel className="" aria-label="Global"></Popover.Panel>
            </>
          )}
        </Popover>
      </div>
    </div>
  );
};

export default Reactions;
