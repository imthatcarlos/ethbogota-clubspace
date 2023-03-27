import CheckCircleSVG from '@/assets/svg/check-circle.svg';
import LensSVG from '@/assets/svg/lens.svg';
import { TIER_OPEN, TIER_GATED_LENS_COLLECT } from "@/lib/consts";
import { MultiStepFormWrapper } from "./MultiStepFormWrapper";

const SelectTier = ({ setSpaceTier, spaceTier }) => {
  return (
    <MultiStepFormWrapper>
      <div className="w-full flex flex-col gap-2">
        <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">1. Is your space Open or Gated?</h2>
        <p className=""><strong>Open</strong>: Anyone can tune in</p>
        <p className="mb-4"><strong>Gated - Lens Collect</strong>: Listeners must collect a Lens Post</p>

        <div className="flex flex w-full justify-center relative grid-cols-2 gap-4">
          <div
            className="flex w-full items-center pl-4 border border-gray-200 rounded bg-white cursor-pointer"
            onClick={() => setSpaceTier(TIER_OPEN)}
          >
            <input
              id="radio-TIER_OPEN-spaceTier"
              type="radio"
              value=""
              name="bordered-radio"
              className="w-4 h-4 text-[color:var(--club-red)] bg-gray-100 border-gray-300 focus:ring-0 cursor-pointer"
              checked={spaceTier === TIER_OPEN}
            />
            <CheckCircleSVG height={45} className="ml-5 mr-5" width={45} />
            <label htmlFor="radio-TIER_OPEN-spaceTier" className="w-full py-4 ml-2 text-sm font-medium text-black cursor-pointer">Open</label>
          </div>
          <div
            className="flex w-full items-center pl-4 border border-gray-200 rounded bg-white cursor-pointer"
            onClick={() => setSpaceTier(TIER_GATED_LENS_COLLECT)}
          >
            <input
              id="radio-gated-lens"
              type="radio"
              value=""
              name="bordered-radio"
              className="w-4 h-4 text-[color:var(--club-red)] bg-gray-100 border-gray-300 focus:ring-0 cursor-pointer"
              checked={spaceTier === TIER_GATED_LENS_COLLECT}
            />
            <LensSVG height={50} className="ml-5 mr-5" width={50} />
            <label htmlFor="radio-gated-lens" className="w-full py-4 ml-2 text-sm font-medium text-black cursor-pointer">Lens Collect</label>
          </div>
        </div>
      </div>
    </MultiStepFormWrapper>
  );
};

export default SelectTier;
