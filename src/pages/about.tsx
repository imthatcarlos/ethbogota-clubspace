import { useRouter } from "next/router";
import ClubspaceNeon from "@/assets/svg/clubspace-neon.svg";
import ClubspaceSoftGlow from "@/assets/svg/soft-glow-filter.svg";

const About = () => {
  const router = useRouter();

  return (
    <div className="p-12">
      <section className="w-full text-secondary mt-12 sm:mt-32 flex flex-col gap-8 mix-blend-lighten px-16 items-center justify-center">
        <ClubspaceSoftGlow />
        <ClubspaceNeon className="min-w-fit svg-logo" />
      </section>
      <section className="mt-4 max-w-screen-md">
        <br/>
        <p className="font-semibold text-2xl mt-4">What is ClubSpace?</p>
        <p className="mt-4">
          ClubSpace combines the features of Twitter Spaces and radio stations, with the added ability to promote music NFTs and interact on web3 social.
        </p>
        <p className="mt-4">
          Artists can use it to host live listening parties for their NFT drops - created on open protocols like Decent and Sound.
          Listeners can tune in to the live live audio stream, connect with Lens users, and purchase the host's new music NFT.
          Additionally, ClubSpace offers other features to help artists maximize their earning potential.
        </p>
        <br/>
        <button
          onClick={() => router.push("/")}
          className="btn-create-space relative overflow-hidden inline-flex capitalize w-fit font-sf-pro-text bg-white text-black text-xl py-3 px-6 rounded-md font-bold duration-300 transition-all hover:-translate-y-[2px] hover:text-white"
        >
          <span className="z-10">Home</span>
        </button>
        <br/>
        <br/>
        <p className="mt-4 font-semibold text-xl">Features of a live space</p>
        <ol className="list-disc mt-4 ml-4">
          <li><strong>Featured Drop</strong> - The core feature of a space is to promote your latest music NFT drop from Decent or Sound</li>
          <li><strong>Connected Audience</strong> - Everyone that is connected and listening in live will be shown in the audience, with their Lens profile or ENS data shown</li>
          <li><strong>Live Audio Player</strong> - Along the bottom edge of your screen you will see the song that is currently playing from the live playlist</li>
          <li><strong>Party Favor</strong> - The party favor is Clubspace’s version of a POAP</li>
          <li><strong>Host Mic</strong> - The microphone feature allows the host to pop in and speak to the audience</li>
          <li><strong>Scheduled Spaces</strong> - The schedule spaces feature allows you to reserve a time slot ahead of time for your space</li>
          <li><strong>Sponsored Party Favors</strong> - Coming soon</li>
          <li><strong>Live Video</strong> - Coming soon</li>
          <li><strong>Ticketed Spaces</strong> - Coming soon</li>
          <li><strong>Space co-hosting + recording</strong> - Coming soon</li>
        </ol>
        <br/>
        <p className="font-semibold mt-4 text-xl">Mirror posts</p>
        <p className="mt-4">
          <a
            className="underline"
            target="_blank"
            rel="noreferrer"
            href="https://mirror.xyz/madfiprotocol.eth/Sdr7CGQqczKOPfF0SOOylajC3N35lW_qyAFTtPrdQTQ"
          >
            Introducing ClubSpace
          </a>
        </p>
        <p className="mt-4">
          <a
            className="underline"
            target="_blank"
            rel="noreferrer"
            href="https://mirror.xyz/carlosbeltran.eth/9BVX0ZScWq9TcdTE_ZqzqyIqN7U0Pltc55v0cz_niJo"
          >
            Onboarding Guide
          </a>
        </p>
      </section>
    </div>
  );
};

export default About;
