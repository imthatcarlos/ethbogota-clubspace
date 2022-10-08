import { useAccount } from "wagmi";
import { useGetPlaylistsFromAddress } from "@/services/spinamp/getPlaylists";

const SelectPlaylist = ({ selectPlaylist }) => {
  const { address } = useAccount();

  const { data: playlists } = useGetPlaylistsFromAddress({}, address);

  return (
    <div className="w-full">
      <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">Select a Playlist</h2>
      {playlists &&
        playlists.map((p) => (
          <div key={p.id} className="mt-4">
            <p>{p.title}</p>
            <button
              className="mt-2 flex w-36 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => selectPlaylist(p)}
            >
              Select
            </button>
          </div>
        ))}
    </div>
  );
};

export default SelectPlaylist;
