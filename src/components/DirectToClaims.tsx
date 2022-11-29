import Link from "next/link";

const DirectToClaims = ({ address }) => (
  <div className="">
    This stream is unavailable or already at capacity! Try again in a few minutes.
    {/* Head to the claims page to pick up your party favor if you attended!
    <Link href={`/claim/${address}`}>
      <button className="mt-8 !w-full btn max-w-xs">Party Favors 🥳</button>
    </Link> */}
  </div>
);

export default DirectToClaims;
