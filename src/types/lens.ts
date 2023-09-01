export type DefaultLensProfile = {
  id: string;
  name: string | null;
  bio: string | null;
  metadata: string | null;
  picture: {
    uri: string | null;
    original: {
      url: string | null;
    } | null;
  } | null;
  handle: string;
  coverPicture: string | null;
  ownedBy: string;
  stats: {
    totalFollowers: number;
    totalFollowing: number;
  };
  followModule: string | null;
  lensHandle: string | null;
};
