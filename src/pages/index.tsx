import { FC, useEffect, useState } from "react";
// import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Hero } from "@/components/Hero";
import { useTheme } from "next-themes";

const Home: FC = () => {
  const [mounted, setMounted] = useState(false);

  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <Hero />;
};

export default Home;
