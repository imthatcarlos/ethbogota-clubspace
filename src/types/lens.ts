export type DefaultLensProfile = {
  id: string;
  picture: {
    uri: string | null;
    original: {
      url: string | null;
    } | null;
  } | null;
  handle: string;
};
