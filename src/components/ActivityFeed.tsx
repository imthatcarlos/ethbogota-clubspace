import { getUrlForImageFromIpfs } from "@/utils";
import axios from "axios";
import { utils } from "ethers";
import { useEffect, useState } from "react";

interface Activity {
  numGuests: number;
  drop: any;
  decentContract?: any;
  handle: string;
  spinampPlaylistId: string;
  createdAt: number;
  startAt: number;
  totalSales: string;
  totalSalesAmount?: string;
}

const ActivityItem = ({ activity }: { activity: Activity }) => {
  const drop = activity.decentContract || activity.drop;

  if (!drop) return;

  // get days passed since space was live
  const activityTime = () => {
    const now = new Date();
    const startedAt = activity.startAt || activity.createdAt;
    const timePassed = Number(now) - startedAt * 1000;
    if (timePassed > 86400000) {
      const days = Math.floor(timePassed / 86400000);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      const hours = Math.floor(timePassed / 3600000);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
  };

  const isVideo = () => drop.isVideo || drop.image.endsWith(".mp4");

  return (
    <div className="min-w-[240px] rounded-xl border-[1px] border-border p-3">
      {!isVideo() ? (
        <img src={getUrlForImageFromIpfs(drop.image)} width="220" height="220" className="mb-2 rounded-xl" />
      ) : (
        <video
          src={getUrlForImageFromIpfs(drop.image)}
          width="220"
          height="220"
          className="mb-2 rounded-xl"
          autoPlay
          muted
          loop
        />
      )}
      <p className="text-xl font-semibold">{drop.name}</p>
      <p>@{activity.handle}</p>
      <p>{activity.numGuests} attendees</p>
      <p>
        {utils.formatEther(activity.totalSales)} {drop.chainId === 137 ? "MATIC" : "ETH"} raised
      </p>
      {activity.totalSalesAmount && <p>{activity.totalSalesAmount} minted</p>}
      <p>{activityTime()}</p>
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
    <div className="mb-16 w-full">
      {hostedSpaces.length > 0 && (
        <>
          <h2 className="text-md mt-16 mb-8 text-3xl font-bold tracking-tight">Recent Spaces</h2>
          <div className="flex gap-8 overflow-auto">
            {hostedSpaces
              .map((activity: Activity, i: number) => <ActivityItem key={i} activity={activity} />)
              .filter((a) => a)}
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityFeed;
