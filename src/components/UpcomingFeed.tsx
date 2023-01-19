import { getUrlForImageFromIpfs } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import Bell from "@/assets/svg/bell.svg";
import Live from "@/assets/svg/live.svg";
import { subscribeNotifications } from "@/services/push/clientSide";
import Link from "next/link";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/consts";

function timeUntil(timeStamp) {
  let time = new Date(timeStamp * 1000);
  let now = new Date();
  if (time < now) {
    return (
      <div className="flex">
        <Live />
        Live Now
      </div>
    );
  }
  let hours = time.getHours();
  let minutes: any = time.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  let days = time.getDate() - now.getDate();
  let dayString = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`;

  return `${dayString} ${hours}:${minutes}`;
}

const filterTestSpaces = (space: any) => {
  if (process.env.NEXT_PUBLIC_IS_PRODUCTION === "false") {
    return true;
  }
  return (
    space.decentContractChainId !== 80001 && space.decentContractChainId !== 5 && space.decentContractChainId !== 420
  );
};

export const UpcomingItem = ({ activity }: { activity: any }) => {
  return (
    <a href={`${NEXT_PUBLIC_SITE_URL}/live/${activity.handle}`} target="_blank" rel="noreferrer">
      <div className={`rounded-md min-w-[220px] cursor-pointer`}>
        <div
          style={{
            backgroundImage: `url(${getUrlForImageFromIpfs(activity.productBannerUrl)})`,
            height: "150px",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "100%",
            borderRadius: "8px",
            paddingTop: "4px",
            paddingLeft: "6px",
          }}
        >
          <p className="text-black rounded-md bg-white/75 text-sm px-3 w-fit">
            {timeUntil(activity.startAt || activity.createdAt)}
          </p>
          <div style={{ padding: "90px 0 0 0" }}>
            <p className="text-xl font-semibold">@{activity.handle}</p>
          </div>
        </div>
      </div>
    </a>
  );
};

export const UpcomingFeed = () => {
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    const _fetchAsync = async () => {
      const {
        data: { spaces },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SPACE_API_URL}/upcoming/all`);
      setSpaces(spaces.filter((space) => !space.ended && filterTestSpaces(space)));
    };
    _fetchAsync();
  }, []);

  return (
    <div className="w-full mb-8 mt-8">
      {spaces.length > 0 && (
        <>
          <div className="flex mt-16 mb-8">
            {/**
                <button
                  className="p-1 rounded-md border-white border-[2px] mr-3"
                  onClick={() => subscribeNotifications(signer, address)}
                  disabled={!signer || !address}
                >
                  <Bell />
                </button>
              */}
            <h2 className="text-md font-bold tracking-tight text-3xl">Upcoming Spaces</h2>
          </div>
          <div className="flex overflow-auto gap-8">
            {spaces.map((activity: any, i: number) => (
              <UpcomingItem key={i} activity={activity} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
