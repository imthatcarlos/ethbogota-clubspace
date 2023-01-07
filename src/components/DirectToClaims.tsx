import Link from "next/link";

const DirectToClaims = ({ address }) => (
  <div className="">
    This stream is unavailable, has already ended, or is at capacity. Try again later?
    Head to the claims page to pick up your party favor if you attended!
    <Link href={`/u/${address}`}>
      <button className="mt-8 !w-full btn max-w-xs">Party Favors 🥳</button>
    </Link>
  </div>
);

export default DirectToClaims;
