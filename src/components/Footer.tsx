import { useRouter } from "next/router";
import MirrorSvg from "@/assets/svg/mirror.svg";

export const Footer = () => {
  const router = useRouter();
  const isLivePage = router.pathname.includes("/live/");

  return (
    <footer className="z-9 relative flex w-full items-center justify-between border-t-[0.1px] border-t-border bg-black py-1">
      <div className={`px-4 py-12 xs:px-8 md:px-16 ${isLivePage ? "pb-36" : "pb-12"} mx-auto`}>
        <div className="flex items-center justify-between gap-8">
          <div className="flex w-full items-center justify-evenly md:w-fit md:gap-8">
            <img src="/clubspace-logo.png" alt="Clubspace logo" className="max-w-[75px]" />
          </div>
          <div className="flex flex-col items-center gap-8 md:items-start">
            <div className="text-normal font-ownersx text-5xl font-extrabold">
              <p className="text-1xl font-ownersx landing-page-subtext-shadow w-full whitespace-nowrap text-center text-[15px] tracking-wide">
                ClubSpace by{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://madfinance.xyz"
                  className="link-hover font-helvetica-text text-secondary"
                >
                  MAD FINANCE
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
