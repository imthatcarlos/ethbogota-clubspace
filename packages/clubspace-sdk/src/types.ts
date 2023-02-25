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
  creatorAddress: string;
  creatorLensHandle?: string;
  creatorLensProfileId?: string;
  lensPubId: string;
  spinampPlaylistId: string;
  drop: any;
  clubSpaceId: string;
  createdAt: number;
  endAt: number; // @TODO: updated once space ends
  handle: string;
  streamURL: string;
  queuedTrackIds: string[];
  stats: {
    activeUsersInRoomCount: number;
    activeSample: [{
      id: string;
      handle?: string;
      profile?: {
        avatar?: string;
        name?: string;
        totalFollowers?: number;
        id?: string;
      };
      hasBadge?: boolean
    }]
  }
}

export interface ICreateSpace {
  creatorAddress: string;
  creatorLensHandle: string;
  creatorLensProfileId: string;
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
  createdAt: number;
  endAt: number;
  handle: string;
  partyFavorContractAddress: string;
  startAt: number;
}