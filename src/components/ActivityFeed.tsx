import { getUrlForImageFromIpfs } from "@/utils";
import axios from "axios";
import { utils } from "ethers";
import { useEffect, useState } from "react";

interface Activity {
  numGuests: number;
  decentContract: any;
  handle: string;
  spinampPlaylistId: string;
  createdAt: number;
  totalSales: string;
}

const ActivityItem = ({ activity }: { activity: Activity }) => {
  // get days passed since space was live
  const activityTime = () => {
    const now = new Date();
    const timePassed = Number(now) - activity.createdAt * 1000;
    return Math.floor(timePassed / 86400000);
  };

  return (
    <div className="p-3 rounded-xl min-w-[240px] border-slate-500 border-[1px]">
      {!activity.decentContract.isVideo ? (
        <img
          src={getUrlForImageFromIpfs(activity.decentContract.image)}
          width="220"
          height="220"
          className="rounded-xl mb-2"
        />
      ) : (
        <video
          src={getUrlForImageFromIpfs(activity.decentContract.image)}
          width="220"
          height="220"
          className="rounded-xl mb-2"
          autoPlay
          muted
          loop
        />
      )}
      <p className="text-xl font-semibold">{activity.decentContract.name}</p>
      <p>@{activity.handle}</p>
      <p>{activity.numGuests} attendees</p>
      <p>
        {utils.formatEther(activity.totalSales)} {activity.decentContract.chainId === 137 ? "MATIC" : "ETH"} in sales
      </p>
      <p>{activityTime()} days ago</p>
    </div>
  );
};

const ActivityFeed = () => {
  const [hostedSpaces, setHostedSpaces] = useState([]);
  useEffect(() => {
    const _fetchAsync = async () => {
      const { data } = await axios.get(`/api/mongo/activity-feed`);
      setHostedSpaces(data);
    };
    _fetchAsync();
  }, []);

  return (
    <div className="w-full mb-16">
      {hostedSpaces.length > 0 && (
        <>
          <h2 className="text-md font-bold tracking-tight text-3xl mt-16 mb-8">Recent Spaces</h2>
          <div className="flex overflow-auto gap-8">
            {hostedSpaces.map((activity: Activity, i: number) => (
              <ActivityItem key={i} activity={activity} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityFeed;
