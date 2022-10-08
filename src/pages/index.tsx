import { FC, useEffect, useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Hero } from "@/components/Hero";

const Home: FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Hero />
      {/** List of the parties you went to, fetch from API (get contract events, use the clubSpaceId, check privy) **/}
      <ThemeSwitcher className="absolute bottom-6 right-6" />
    </>
  );
};

export default Home;
