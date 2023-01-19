import { MultiStepFormWrapper } from "./MultiStepFormWrapper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, subDays } from "@/utils";
import { CalendarIcon } from "@heroicons/react/outline";

const CreateLaunchTime = ({ setLaunchDate, launchDate, updateFields }) => {
  return (
    <MultiStepFormWrapper>
      <div className="w-full flex flex-col gap-3">
        <label htmlFor="lauch-time" className="text-md font-bold tracking-tight sm:text-lg md:text-xl">
          When does your Clubspace launch?
        </label>
        <DatePicker
          showTimeSelect
          includeDateIntervals={[{ start: subDays(new Date(), 0), end: addDays(new Date(), 7) }]}
          dateFormat="MMMM d, yyyy h:mmaa"
          selected={launchDate}
          onChange={(date: Date) => {
            updateFields({ launchDate: date });
            setLaunchDate(date);
          }}
        >
          <div>
            <div className="text-red-600 py-1 px-2 inline-flex items-center gap-x-1">
              <CalendarIcon className="h-5 w-5" /> <span>Date must be within the next week.</span>
            </div>
          </div>
        </DatePicker>
      </div>
    </MultiStepFormWrapper>
  );
};

export default CreateLaunchTime;
