import { MultiStepFormWrapper } from "./MultiStepFormWrapper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { addDays, subDays } from "@/utils";
import { CalendarIcon } from "@heroicons/react/outline";

const CreateLaunchTime = ({ setLaunchDate, launchDate, updateFields }) => {
  return (
    <MultiStepFormWrapper>
      <div className="w-full flex flex-col gap-2">
        <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">5. Schedule your space [OPTIONAL]</h2>
        <DatePicker
          showTimeSelect
          includeDateIntervals={[{ start: subDays(new Date(), 1), end: addDays(new Date(), 7) }]}
          dateFormat="MMMM d, yyyy h:mmaa"
          selected={launchDate}
          onChange={(date: Date) => {
            const dateTs = Math.floor(date.getTime() / 1000);
            if (dateTs < Math.floor(Date.now() / 1000)) {
              toast.error('Date cannot be in the past');
              return;
            }
            updateFields({ launchDate: date });
            setLaunchDate(dateTs);
          }}
        >
          <div>
            <div className="text-red-600 py-1 px-2 inline-flex items-center gap-x-1">
              <CalendarIcon className="h-5 w-5" /> <span>Must be within the next week</span>
            </div>
          </div>
        </DatePicker>
      </div>
    </MultiStepFormWrapper>
  );
};

export default CreateLaunchTime;
