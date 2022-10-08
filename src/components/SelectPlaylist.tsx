import { useEffect, useState } from "react";
import { fetchCollectorPlaylists } from "@spinamp/spinamp-sdk";
import { useAccount } from "wagmi";

const SelectPlaylist = ({ selectPlaylist }) => {
  const { address, status } = useAccount();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    const playlists = await fetchCollectorPlaylists(address);
    setPlaylists(playlists);
  };

  return (
    <div>
        <p>Select a Playlist</p>
      {playlists.map(({ title, id }) => (
        <div key={id}>
          <p>{title}</p>
          <button
            className="flex w-36 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => selectPlaylist({id, title})}
          >
            Select
          </button>
        </div>
      ))}
    </div>
  );
};

export default SelectPlaylist;
