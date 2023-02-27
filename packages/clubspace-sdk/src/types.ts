export interface IArtist {
  id: string;
  name: string;
  createdAtTime: string;
  slug: string;
  profiles: {
    [key: string]: IArtistProfile;
  };
}
export interface IArtistProfile {
  platformInternalId: string;
  platformId: string;
  name: string;
  createdAtTime: string;
  avatarUrl?: string;
  websiteUrl?: string;
}

export interface ITrack {
  id: string;
  platformInternalId: string;
  title: string;
  slug: string;
  platformId: string;
  artistId: string;
  artist: IArtist;
  lossyAudioUrl: string;
  lossyArtworkUrl?: string;
  description?: string;
  createdAtTime?: string;
  websiteUrl?: string;
}

export interface IClubSpaceObject {
  lensPubId: string;
  spinampPlaylistId: string;
  drop: any;
  clubSpaceId: string;
  createdAt: number;
  endAt: number; // @TODO: updated once space ends
  streamURL: string;
  queuedTrackIds: string[];
  stats: {
    activeUsersInRoomCount: number;
    activeSample: [
      {
        id: string;
        handle?: string;
        profile?: {
          avatar?: string;
          name?: string;
          totalFollowers?: number;
          id?: string;
        };
        hasBadge?: boolean;
      }
    ];
  };
}

export interface ICreateSpace {
  lensPubId: string;
  spinampPlaylistId: string;
  drop: {
    decentContractAddress: string;
    decentContractType: string;
    decentContractChainId: number;
    productBannerUrl: string;
    productBannerIsVideo: boolean;
    protocol: string;
  };
  partyFavorContractAddress: string;
  clubSpaceId?: string;
  semGroupIdHex?: string;
  createdAt?: number;
  endAt?: number;
  startAt?: number;
}

export type ILensProfile = {
  id: string;
  ownedBy: string;
  handle: string;
  picture: {
    uri: string;
    original: {
      url: string;
    };
  };
  name: string;
  bio: string;
};
