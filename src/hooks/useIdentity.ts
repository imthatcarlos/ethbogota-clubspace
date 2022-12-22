import { useCallback, useEffect, useState } from "react";
import { Identity } from "@semaphore-protocol/identity";

const SEM_IDENTITY_KEY = "sem_identity";

export default () => {
  const [identity, setIdentity] = useState<any>();

  useEffect(() => {
    const identityString = localStorage.getItem(SEM_IDENTITY_KEY);

    if (identityString) {
      const identity = new Identity(identityString);

      setIdentity(identity);
    } else {
      console.log("need new identity");
      createIdentity();
    }
  }, []);

  const createIdentity = useCallback(async () => {
    try {
      const _identity = new Identity();
      setIdentity(_identity);
      localStorage.setItem(SEM_IDENTITY_KEY, _identity.toString());
      console.log("Your new Semaphore identity was just created 🎉");
    } catch (e) {
      return
    }
  }, []);

  return { identity, createIdentity };
};
