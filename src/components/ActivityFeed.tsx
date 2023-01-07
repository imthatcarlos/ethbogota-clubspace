import { getUrlForImageFromIpfs } from "@/utils";
import axios from "axios";
import { utils } from "ethers";
import { useEffect, useState } from "react";

const MIN_SPACES = process.env.NEXT_PUBLIC_IS_PRODUCTION === "true" ? 5 : 0;

interface Activity {
  numGuests: number;
  decentContract: any;
  handle: string;
  spinampPlaylistId: string;
  createdAt: number;
  totalSales: string;
}

const ActivityItem = ({ activity }: { activity: Activity }) => {
  return (
    <div className="p-3 bg-slate-500 rounded-xl min-w-[240px]">
      <img
        src={getUrlForImageFromIpfs(activity.decentContract.image)}
        width="220"
        height="220"
        className="rounded-xl mb-2"
      />
      <p className="text-xl">{activity.decentContract.name}</p>
      <p>Hosted by {activity.handle}</p>
      <p>{activity.numGuests} attendees</p>
      <p>
        {utils.formatEther(activity.totalSales)} {activity.decentContract.chainId === 137 ? "MATIC" : "ETH"} in sales
      </p>
    </div>
  );
};

const ActivityFeed = () => {
  const [hostedSpaces, setHostedSpaces] = useState([]);
  useEffect(() => {
    const getHostedSpaces = async () => {
      const { data } = await axios.get(`/api/mongo/activity-feed`);
      setHostedSpaces(data);
    };
    getHostedSpaces();
  }, []);

  return (
    <div className="max-w-full">
      {hostedSpaces.length >= MIN_SPACES ? (
        <>
          <h2 className="text-md font-bold tracking-tight text-3xl mt-16 mb-8">Past Spaces</h2>
          <div className="flex overflow-x-auto gap-8">
            {hostedSpaces.map((activity: Activity, i: number) => (
              <ActivityItem key={i} activity={activity} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ActivityFeed;
