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
      <ThemeSwitcher className="sticky bottom-28 left-[88%] md:bottom-12 md:left-5" />
    </>
  );
};

export default Home;
