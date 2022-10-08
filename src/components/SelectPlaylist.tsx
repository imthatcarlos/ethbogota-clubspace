import { useEffect, useState } from "react";
import { fetchCollectorPlaylists } from "@spinamp/spinamp-sdk";
import { useAccount } from "wagmi";

const SelectPlaylist = ({ selectPlaylist }) => {
  const { address } = useAccount();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetchPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPlaylists = async () => {
    const playlists = await fetchCollectorPlaylists(address);
    setPlaylists(playlists);
  };

  return (
    <div>
      <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">Select a Playlist</h2>
      {playlists.map((p) => (
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
