import { FC, useEffect, useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Hero } from "@/components/Hero";
import { useLensLogin } from "@/services/lens/login";

const Home: FC = () => {
  const [mounted, setMounted] = useState(false);
  const data = useLensLogin(mounted);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Hero />
      {JSON.stringify(data, null, 2)}
      <ThemeSwitcher className="absolute bottom-6 right-6" />
    </>
  );
};

export default Home;
