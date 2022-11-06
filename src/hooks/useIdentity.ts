import { useCallback, useEffect, useState } from "react";
import { Identity } from "@semaphore-protocol/identity";

export default () => {
  const [identity, setIdentity] = useState<any>();

  useEffect(() => {
    const identityString = localStorage.getItem("identity");

    if (identityString) {
      const identity = new Identity(identityString);

      setIdentity(identity);
    } else {
      console.log("need new identity");
      createIdentity();
    }
  }, []);

  const createIdentity = useCallback(async () => {
    const identity = new Identity();

    setIdentity(identity);

    localStorage.setItem("identity", identity.toString());

    console.log("Your new Semaphore identity was just created 🎉");
  }, []);

  return { identity, createIdentity };
};
