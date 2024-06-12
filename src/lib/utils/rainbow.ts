import { http } from "wagmi";
import { polygon } from "viem/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { JSON_RPC_URL_ALCHEMY_MAP } from "@/lib/consts";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export const appInfo = { appName: "MadFi" };

export const wagmiConfig = getDefaultConfig({
  appName: "MadFi",
  projectId,
  chains: [polygon],
  transports: {
    [polygon.id]: http(JSON_RPC_URL_ALCHEMY_MAP[polygon.id]),
  },
});