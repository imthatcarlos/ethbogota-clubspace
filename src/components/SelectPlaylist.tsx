import { classNames } from "@/lib/utils/classNames";
import { useGetPlaylistsFromAddress } from "@/services/spinamp/getPlaylists";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { IPlaylist, fetchPlaylistById } from "@spinamp/spinamp-sdk";
import { FC, Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { last } from 'lodash/array';
import { MultiStepFormWrapper } from "./MultiStepFormWrapper";

type Props = {
  selectPlaylist: (playlist) => void;
  playlist: IPlaylist;
};

const SelectPlaylist: FC<Props> = ({ selectPlaylist, playlist }) => {
  const { address } = useAccount();
  const [playlistLink, setPlaylistLink] = useState();

  const { data: playlists } = useGetPlaylistsFromAddress({}, address);

  const onPlaylistLinkChanged = async (event) => {
    const val = event.target.value;
    const playlistId = val.includes("https://") ? last(val.split('/')) : val;

    const playlist = await fetchPlaylistById(playlistId);

    if (!playlist?.playlist) {
      toast.error('Spinamp playlist not found!');
    } else {
      selectPlaylist(playlist.playlist);
    }
  }

  return (
    <MultiStepFormWrapper>
      <div className="w-full">
        {/* <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">Select a Playlist</h2> */}
        {playlists && (
          <>
            <Listbox value={playlist} onChange={selectPlaylist}>
              {({ open }) => (
                <>
                  <Listbox.Label className="inline-block mb-3 text-md font-bold tracking-tight sm:text-lg md:text-xl">
                    Select Your Spinamp Playlist or Paste the URL
                  </Listbox.Label>
                  <div className="relative mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                    <Listbox.Button className="relative input py-2 pl-3 pr-10 text-left ">
                      <span className="block truncate">{playlist ? playlist.title : "Select playlist"}</span>
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
                                <span
                                  className={classNames(selected ? "font-semibold" : "font-normal", "block truncate")}
                                >
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
            <br/>
            <input
              value={playlistLink}
              type="text"
              id="playlist_link"
              className="input"
              placeholder="https://"
              required
              onChange={(onPlaylistLinkChanged)}
            />
          </>
        )}
      </div>
    </MultiStepFormWrapper>
  );
};

export default SelectPlaylist;
