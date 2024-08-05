import { useEffect, useState } from "react";
import { Home } from "@/components/Home";
import CreateSpace from "@/components/live/CreateSpace";
import { useAuthenticatedProfileId } from "@/hooks/useLensLogin";

export default () => {
  // TODO: use result of qr code scan
  const { data: authenticatedProfileId } = useAuthenticatedProfileId();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return !authenticatedProfileId ? <Home /> : <CreateSpace />;
};
