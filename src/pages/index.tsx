import { FC } from "react";
import { APP_NAME } from "@/lib/consts";
import { ConnectWallet } from "@/components/ConnectWallet";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Hero } from "@/components/Hero";

const Home: FC = () => {
  return (
    <>
      <Hero />

      <ThemeSwitcher className="absolute bottom-6 right-6" />
    </>
  );
};

export default Home;
