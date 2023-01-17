import { useState } from "react";
import { useSigner, useAccount, useNetwork } from "wagmi";
import DecentLogo from "@/assets/svg/decent.svg";
import SoundLogo from "@/assets/svg/sound.svg";
import { MultiStepFormWrapper } from "./../MultiStepFormWrapper";
import useGetDecentDrops from "@/hooks/useGetDecentDrops";
import { DROP_PROTOCOL_DECENT, DROP_PROTOCOL_SOUND } from "@/lib/consts";
import DecentDrop from "./DecentDrop";

const SetFeaturedProduct = ({ setDecentProduct, decentProduct = undefined, updateFields }) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const { data: decentDrops, isLoading } = useGetDecentDrops(address, chain.id, signer);
  const [selectedProtocol, setSelectedProtocol] = useState(DROP_PROTOCOL_DECENT);
  const [decentProduct, setDecentProduct] = useState();

  return (
    <MultiStepFormWrapper>
      <div className="w-full">
        <div className="w-full">
          <div className="w-full flex flex-col gap-4">
            <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">Set Your Featured NFT Drop</h2>
            {
              isLoading && (
                <p>Loading your drops...</p>
              )
            }
            {
              !isLoading && (
                <>
                  <div className="flex flex w-full justify-center relative grid-cols-2 gap-4">
                    <div
                      className="flex w-full items-center pl-4 border border-gray-200 rounded bg-white cursor-pointer"
                      onClick={() => setSelectedProtocol(DROP_PROTOCOL_DECENT)}
                    >
                      <input
                        id="radio-protocol-decent"
                        type="radio"
                        value=""
                        name="bordered-radio"
                        className="w-4 h-4 text-[color:var(--club-red)] bg-gray-100 border-gray-300 focus:ring-[color:var(--club-red)]"
                        checked={selectedProtocol === DROP_PROTOCOL_DECENT}
                      />
                      <DecentLogo height={50} className="ml-5 mr-5" width={50} />
                      <label for="radio-protocol-decent" className="w-full py-4 ml-2 text-sm font-medium text-black">Decent</label>
                    </div>
                    <div
                      className="flex w-full items-center pl-4 border border-gray-200 rounded bg-white cursor-pointer"
                      onClick={() => setSelectedProtocol(DROP_PROTOCOL_SOUND)}
                    >
                      <input
                        id="radio-protocol-sound"
                        type="radio"
                        value=""
                        name="bordered-radio"
                        class="w-4 h-4 text-[color:var(--club-red)] bg-gray-100 border-gray-300 focus:ring-[color:var(--club-red)]"
                        checked={selectedProtocol === DROP_PROTOCOL_SOUND}
                      />
                      <SoundLogo height={50} className="ml-5 mr-5" width={50} />
                      <label for="radio-protocol-sound" className="w-full py-4 ml-2 text-sm font-medium text-black">Sound</label>
                    </div>
                  </div>
                </>
              )
            }
            {selectedProtocol === DROP_PROTOCOL_DECENT && (
              <DecentDrop
                deployedProducts={decentDrops}
                decentProduct={decentProduct}
                setDecentProduct={setDecentProduct}
              />
            )}
          </div>
        </div>
      </div>
    </MultiStepFormWrapper>
  );
};

export default SetFeaturedProduct;
