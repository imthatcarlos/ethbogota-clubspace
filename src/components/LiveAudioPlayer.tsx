import React, { useState } from "react";
import { AudioPlayer } from "decent-audio-player";
import { ITrack } from "@spinamp/spinamp-sdk";
import { getUrlForImageFromIpfs } from "@/utils/ipfs";

interface Props {
  streamURL: string;
  playlistTracks: ITrack[];
};

// @TODO: will we have feedback from the audio player api of the current track?
export const LiveAudioPlayer = ({ streamURL, playlistTracks }: Props) => {

  console.log(streamURL);
  console.log(playlistTracks);

  return (
    <>
      <div>
        <h2 className="my-4 text-4xl font-bold tracking-tight sm:text-2xl md:text-5xl drop-shadow-sm text-center">
          Live
        </h2>
        <div className="flex w-full justify-center">
          <div className="max-w-[20rem] min-w-[17rem]">
            <div className="bg-slate-800 shadow-xl rounded-lg">
              <div className="p-2 pt-10">
                <AudioPlayer
                  size={56}
                  audioSrc={streamURL}
                  callbackAfterPlay={() => { console.log('callbackAfterPlay') }}
                  active
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
