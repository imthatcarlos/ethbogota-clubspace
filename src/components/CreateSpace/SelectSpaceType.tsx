import { RadioGroup } from "@headlessui/react";
import { CameraIcon, CheckIcon, MicrophoneIcon, VolumeUpIcon } from "@heroicons/react/outline";
import { MultiStepFormWrapper } from "../MultiStepFormWrapper";

const iconsSize = 18;

const spaceTypes = [
  {
    id: 1,
    label: "Live Video",
    icons: [
      <MicrophoneIcon key="1" width={iconsSize} height={iconsSize} />,
      <CameraIcon key="2" width={iconsSize} height={iconsSize} />,
    ],
    value: "video",
  },
  {
    id: 2,
    label: "Discussion",
    icons: [<MicrophoneIcon key="1" width={iconsSize} height={iconsSize} />],
    value: "discussion",
  },
  {
    id: 3,
    label: "Discussion + Playlist",
    icons: [
      <MicrophoneIcon key="1" width={iconsSize} height={iconsSize} />,
      <VolumeUpIcon key="2" width={iconsSize} height={iconsSize} />,
    ],
    value: "playlist",
  },
];

export const SelectSpaceType = ({
  spaceType,
  setSpaceType,
}: {
  spaceType: string;
  setSpaceType: (v: string) => void;
}) => {
  return (
    <MultiStepFormWrapper>
      <RadioGroup value={spaceType} onChange={(value) => setSpaceType(value)}>
        <RadioGroup.Label className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">
          2. Select space type
        </RadioGroup.Label>
        <div className="space-y-2">
          {spaceTypes.map((space) => (
            <RadioGroup.Option
              key={space.id}
              value={space.value}
              className={({ active, checked }) =>
                `${active ? "ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-300" : ""}
                  ${checked ? "bg-sky-900 bg-opacity-75 text-white" : "bg-white"}
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
              }
            >
              {({ active, checked }) => (
                <>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <RadioGroup.Label as="p" className={`font-medium  ${checked ? "text-white" : "text-gray-900"}`}>
                          {space.label}
                        </RadioGroup.Label>
                        <RadioGroup.Description
                          as="span"
                          className={`flex items-center gap-2 ${checked ? "text-sky-100" : "text-gray-500"}`}
                        >
                          {space.icons.map((icon, idx) => (
                            <span key={idx}>{icon}</span>
                          ))}
                        </RadioGroup.Description>
                      </div>
                    </div>
                    {checked && (
                      <div className="shrink-0 text-white">
                        <CheckIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </MultiStepFormWrapper>
  );
};
