import React, { useState } from 'react';
import { XIcon } from "@heroicons/react/solid";

interface CreateSpaceFormProps {
  updateFields: (fields: any) => void;
  roomName?: string;
  description?: string;
  invitedHandles: string[];
}

const CreateSpaceForm = ({ updateFields, roomName, description, invitedHandles }: CreateSpaceFormProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const newHandle = inputValue.trim().startsWith('@') ? inputValue.trim().substring(1) : inputValue.trim();
      if (newHandle && !invitedHandles.includes(newHandle) && invitedHandles.length < 3) {
        updateFields({ invitedHandles: [...invitedHandles, newHandle] });
        setInputValue('');
      }
    }
  };

  const removeHandle = (handleToRemove) => {
    updateFields({ invitedHandles: invitedHandles.filter(handle => handle !== handleToRemove) });
  };

  return (
    <div className="grid grid-cols-5 gap-4 md:gap-x-20 gap-x-5">
      <div className="col-span-3 flex flex-col gap-2">
        <label htmlFor="lens-post" className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">
          Event Name
        </label>
        <input
          value={roomName}
          type="text"
          className="mt-4 block w-full rounded-md text-secondary placeholder:text-secondary/70 border-dark-grey bg-transparent shadow-sm focus:border-dark-grey focus:ring-dark-grey sm:text-sm"
          placeholder={`My stream`}
          onChange={(e) => updateFields({ roomName: e.target.value })}
        />
        <label htmlFor="lens-post" className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">
          Event Description
        </label>
        <input
          value={description}
          type="text"
          className="mt-4 block w-full rounded-md text-secondary placeholder:text-secondary/70 border-dark-grey bg-transparent shadow-sm focus:border-dark-grey focus:ring-dark-grey sm:text-sm"
          placeholder={`My stream`}
          onChange={(e) => updateFields({ description: e.target.value })}
        />
      </div>
      <div className="col-span-5">
        <div className="col-span-3 flex flex-col gap-2">
          <label htmlFor="co-hosts-input" className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">
            Invite Co-Hosts? Up to 3
          </label>
          <div className="flex flex-wrap items-center gap-2 border-dark-grey bg-transparent shadow-sm rounded-md p-2">
            <div className="grid grid-cols-3 gap-2">
              {invitedHandles.map((handle, index) => (
                <span key={index} className="rounded-lg bg-dark-grey shadow-md transition-all cursor-pointer p-2 flex items-center justify-center">
                  {handle}
                  <span
                    className="ml-2 h-4 w-4 text-gray-500 cursor-pointer"
                    onClick={() => removeHandle(handle)}
                  >x</span>
                </span>
              ))}
              {Array.from({ length: 3 - invitedHandles.length }, (_, index) => (
                <div key={`placeholder-${index}`} className="opacity-0"></div>
              ))}
            </div>
            <input
              value={inputValue}
              type="text"
              id="co-hosts-input"
              className="mt-2 block w-full rounded-md text-secondary placeholder:text-secondary/70 border-dark-grey bg-transparent shadow-sm focus:border-dark-grey focus:ring-dark-grey sm:text-sm"
              placeholder={'@bonsai + Enter'}
              onKeyDown={handleKeyDown}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={invitedHandles.length === 3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceForm;