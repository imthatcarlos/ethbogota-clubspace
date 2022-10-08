import { FC, useEffect, useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Hero } from "@/components/Hero";
import { useLensLogin } from "@/services/lens/login";

const Home: FC = () => {
  const [mounted, setMounted] = useState(false);
  const { login, ...rest } = useLensLogin();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Hero />
      <button onClick={login}>{!Object.keys(rest).length ? "Login lens" : "Logged in"}</button>
      <ThemeSwitcher className="absolute bottom-6 right-6" />
    </>
  );
};

export default Home;
