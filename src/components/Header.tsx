import { useState } from "react";
import { useLogin, useLogout, useProfile, ProfileId } from "@lens-protocol/react-web";
import { useAuthenticatedProfileId } from "@/hooks/useLensLogin";

import { ConnectWallet } from "./ConnectWallet";
import LoginWithLensModal from "./LoginWithLensModal";

export const Header = () => {
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const { execute: login, loading: signingIn } = useLogin();
  const { execute: logout } = useLogout();
  const { data: authenticatedProfileId } = useAuthenticatedProfileId();
  const { data: authenticatedProfile } = useProfile({
    forProfileId: authenticatedProfileId as ProfileId,
  });

  if (!authenticatedProfileId) {
    return (
      <header className="shadow-sm">
        <nav className="max-w-[85%] mx-auto flex justify-center w-full" aria-label="Top">
          <div className="w-full items-center py-6 text-center">
            LOGO
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header className="shadow-sm">
      <nav className="max-w-[85%] mx-auto items-center w-full" aria-label="Top">
        <div className="flex w-full items-center justify-between py-6">
          <div className="flex items-center">
            <div className="w-max">
              LOGO
            </div>
          </div>
          <div className="hidden lg:block">
            { /** <SearchApp />  */}
          </div>
          <ConnectWallet
            setOpenSignInModal={setOpenLoginModal}
            authenticatedProfile={authenticatedProfile}
            signingIn={signingIn}
            logout={logout}
          />
        </div>
      </nav>
      <LoginWithLensModal
        openLoginModal={openLoginModal}
        setOpenLoginModal={setOpenLoginModal}
        login={login}
        authenticatedProfile={authenticatedProfile}
        signingIn={signingIn}
      />
    </header>
  );
};