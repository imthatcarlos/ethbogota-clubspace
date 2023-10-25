import { useRouter } from "next/router";

import { ConnectWallet } from "./ConnectWallet";

const MADFI_DASHBOARD = 'https://madfi.xyz/dashboard';

export const Header = () => {
  const { route } = useRouter();

  if (route === '/') return null;

  return (
    <header className="bg-black border-b border-dark-grey shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:pl-8 lg:pr-6" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-dark-grey border-opacity-80 py-6 lg:border-none">
          <div className="flex items-center">
            <div className="md:pr-12 pr-8 w-max">
              <a className="w-full" href={MADFI_DASHBOARD}>
                <div className="text-normal font-extrabold uppercase text-4xl font-ownersx">
                  <span className="text-primary">MAD</span>
                  <span className="text-secondary">FI</span>
                </div>
              </a>
            </div>
          </div>
          <div className="hidden lg:block">
            { /** <SearchApp />  */}
          </div>
          <ConnectWallet showBalance={false} />
        </div>
      </nav>
    </header>
  );
};