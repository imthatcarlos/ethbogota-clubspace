import { classNames } from "@/lib/utils/classNames";
import { useGetPlaylistsFromAddress } from "@/services/spinamp/getPlaylists";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { IPlaylist } from "@spinamp/spinamp-sdk";
import { FC, Fragment } from "react";
import { useAccount } from "wagmi";

type Props = {
  selectPlaylist: (playlist) => void;
  playlist: IPlaylist;
};

const SelectPlaylist: FC<Props> = ({ selectPlaylist, playlist }) => {
  const { address } = useAccount();

  const { data: playlists } = useGetPlaylistsFromAddress({}, address);

  return (
    <div className="w-full">
      {/* <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">Select a Playlist</h2> */}
      {playlists && (
        <Listbox value={playlist} onChange={selectPlaylist}>
          {({ open }) => (
            <>
              <Listbox.Label className="text-md font-bold tracking-tight sm:text-lg md:text-xl">
                Select a Playlist
              </Listbox.Label>
              <div className="relative mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                <Listbox.Button className="relative input py-2 pl-3 pr-10 text-left ">
                  <span className="block truncate">{playlist ? playlist.title : "Get this live!"}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>

                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md dark:bg-gray-800 bg-white py-1 text-base shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {playlists.map((playlist) => (
                      <Listbox.Option
                        key={playlist.id}
                        className={({ active }) =>
                          classNames(
                            active ? "bg-indigo-600 text-white" : "",
                            "relative cursor-default select-none py-2 pl-3 pr-9"
                          )
                        }
                        value={playlist}
                      >
                        {({ selected, active }) => (
                          <>
                            <span className={classNames(selected ? "font-semibold" : "font-normal", "block truncate")}>
                              {playlist.title}
                            </span>

                            {selected ? (
                              <span
                                className={classNames(
                                  active ? "text-white" : "text-indigo-600",
                                  "absolute inset-y-0 right-0 flex items-center pr-4"
                                )}
                              >
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
      )}
    </div>
  );
};

export default SelectPlaylist;
