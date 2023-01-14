import { getUrlForImageFromIpfs } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import Bell from "@/assets/svg/bell.svg";
import { subscribeNotifications } from "@/services/push/clientSide";
import { useAccount, useSigner } from "wagmi";

interface Activity {
  decentContract: any;
  handle: string;
  avatar: string;
  startAt: number;
}

function timeUntil(timeStamp) {
  let time = new Date(timeStamp * 1000);
  let now = new Date();
  let hours = time.getHours();
  let minutes: any = time.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  let days = time.getDate() - now.getDate();
  let dayString = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`;

  return `${dayString} ${hours}:${minutes}`;
}

const UpcomingItem = ({ activity }: { activity: Activity }) => {
  return (
    <div className="rounded-md min-w-[220px]">
      <div
        style={{
          backgroundImage: `url(${getUrlForImageFromIpfs(activity.decentContract.image)})`,
          height: "130px",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          borderRadius: "8px",
          paddingTop: "4px",
          paddingLeft: "4px",
        }}
      >
        <p className="text-black rounded-md bg-white/75 text-sm px-3 w-fit">{timeUntil(activity.startAt)}</p>
        <div style={{ padding: "56px 0 0 0" }}>
          <p className="">{activity.decentContract.name}</p>
          <p className="text-xl font-semibold">{activity.handle}</p>
        </div>
      </div>
    </div>
  );
};

const UpcomingFeed = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [spaces, setSpaces] = useState([]);
  useEffect(() => {
    const _fetchAsync = async () => {
      // TODO: get upcoming spaces
      // const { data } = await axios.get(`/api/mongo/activity-feed`);
      // setSpaces([
      //   {
      //     decentContract: data[0].decentContract,
      //     handle: data[0].handle,
      //     avatar: "https://cdn.stamp.fyi/avatar/eth:0xdc4471ee9dfca619ac5465fde7cf2634253a9dc6?s=250",
      //     startAt: 1673823600,
      //   },
      // ]);
    };
    _fetchAsync();
  }, []);

  return (
    <div className="w-full mb-16">
      {spaces.length > 0 && (
        <>
          <div className="flex mt-16 mb-8">
            <button
              className="p-1 rounded-md border-white border-[2px] mr-3"
              onClick={() => subscribeNotifications(signer, address)}
              disabled={!signer || !address}
            >
              <Bell />
            </button>
            <h2 className="text-md font-bold tracking-tight text-3xl">Upcoming Spaces</h2>
          </div>
          <div className="flex overflow-auto gap-8">
            {spaces.map((activity: Activity, i: number) => (
              <UpcomingItem key={i} activity={activity} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UpcomingFeed;
