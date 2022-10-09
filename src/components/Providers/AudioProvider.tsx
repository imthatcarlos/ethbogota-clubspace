import { createContext, FC, useContext, useMemo, useReducer, useRef } from "react";

const AudioPlayerContext = createContext({} as any);

type State = {
  playing?: boolean;
  muted?: boolean;
  meta?: any;
  currentTime?: number;
  duration?: number;
};

type Action = {
  type: string;
  payload?: any;
};

const reducers = {
  SET_META(state: State, action: Action) {
    return { ...state, meta: action.payload };
  },
  PLAY(state: State, _action: Action) {
    return { ...state, playing: true };
  },
  PAUSE(state: State, _action: Action) {
    return { ...state, playing: false };
  },
  TOGGLE_MUTE(state: State, _action: Action) {
    return { ...state, muted: !state.muted };
  },
  SET_CURRENT_TIME(state: State, action: Action) {
    return { ...state, currentTime: action.payload };
  },
  SET_DURATION(state: State, action: Action) {
    return { ...state, duration: action.payload };
  },
};

function audioReducer(state: State, action: Action) {
  return reducers[action.type](state, action);
}

type Props = {
  children: React.ReactNode;
};

export const AudioProvider: FC<Props> = ({ children }) => {
  let [state, dispatch] = useReducer(audioReducer, {
    playing: false,
    muted: false,
    duration: 0,
    currentTime: 0,
    meta: null,
  });
  let playerRef = useRef(null);

  let actions = useMemo(() => {
    return {
      play(data) {
        if (data) {
          dispatch({ type: "SET_META", payload: data });

          if (playerRef.current.currentSrc !== data.audio.src) {
            let playbackRate = playerRef.current.playbackRate;
            playerRef.current.src = data.audio.src;
            playerRef.current.load();
            playerRef.current.pause();
            playerRef.current.playbackRate = playbackRate;
            // @ts-ignore
            playerRef.currentTime = 0;
          }
        }

        playerRef.current.play();
      },
      pause() {
        playerRef.current.pause();
      },
      toggle(data) {
        this.isPlaying(data) ? actions.pause() : actions.play(data);
      },
      seekBy(amount) {
        playerRef.current.currentTime += amount;
      },
      seek(time) {
        playerRef.current.currentTime = time;
      },
      playbackRate(rate) {
        playerRef.current.playbackRate = rate;
      },
      toggleMute() {
        dispatch({ type: "TOGGLE_MUTE" });
      },
      isPlaying(data) {
        return data ? state.playing && playerRef.current.currentSrc === data.audio.src : state.playing;
      },
    };
  }, [state.playing]);

  let api = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return (
    <>
      <AudioPlayerContext.Provider value={api}>{children}</AudioPlayerContext.Provider>
      <audio
        ref={playerRef}
        onPlay={() => dispatch({ type: "PLAY" })}
        onPause={() => dispatch({ type: "PAUSE" })}
        onTimeUpdate={(event) => {
          dispatch({
            type: "SET_CURRENT_TIME",
            payload: Math.floor(event.currentTarget.currentTime),
          });
        }}
        onDurationChange={(event) => {
          dispatch({
            type: "SET_DURATION",
            payload: Math.floor(event.currentTarget.duration),
          });
        }}
        muted={state.muted}
      />
    </>
  );
};

export function useAudioPlayer(data?: any) {
  let player = useContext(AudioPlayerContext);
  return useMemo(
    () => ({
      ...player,
      play() {
        player.play(data);
      },
      toggle() {
        player.toggle(data);
      },
      get playing() {
        return player.isPlaying(data);
      },
    }),
    [player, data]
  );
}
