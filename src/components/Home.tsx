import { NextPageWithLayout } from "@/pages/_app";

export const Home: NextPageWithLayout = () => {
  return (
    <div
      className="w-full"
      style={{ height: 'calc(100vh - 88px)' }}
    >
      <div className="text-center items-center pt-20">
        <p className="text-4xl mb-4">Scan QR</p>
      </div>
    </div>
  );
};
