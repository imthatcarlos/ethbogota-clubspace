import {
  textOnly,
  liveStream,
  image,
  video,
  audio,
  article,
  link,
  MetadataLicenseType,
  PublicationMetadataSchema,
} from '@lens-protocol/metadata';

const APP_ID = process.env.NEXT_PUBLIC_APP_ID;

interface LivestreamConfig { playbackUrl: string, title: string, startsAt?: string, endsAt?: string };

const trimify = (value: string): string =>
  value?.replace(/\n\s*\n/g, "\n\n").trim();

const getLinkData = (content: string, profileDisplayName: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let sharingLink = '';
  let cleanContent = content;

  const match = content.match(urlRegex);
  if (match) {
    sharingLink = match[0];
    cleanContent = content.replace(urlRegex, '').trim();
  }

  return {
    sharingLink,
    content: cleanContent,
    appId: APP_ID,
    marketplace: getMarketplaceData(profileDisplayName)
  };
};

const getMarketplaceData = (profileDisplayName: string) => ({
  // external_link: "https://madfi.xyz",
  name: `Post by ${profileDisplayName} on ${APP_ID}`
});

const convertSecondsToISODate = (seconds: number) => {
  const date = new Date(0);
  date.setUTCSeconds(seconds);
  return date.toISOString();
}

const _mainContentFocus = (content: string, mimeType: string | null, isLive = false) => {
  if (isLive) return 'LIVESTREAM';
  if (!mimeType) return 'TEXT_ONLY';
  if (mimeType.includes('image')) return 'IMAGE';
  if (mimeType === 'application/x-mpegURL' || mimeType.includes('video')) return 'VIDEO';
  if (mimeType.includes('audio')) return 'AUDIO';
  if (content.includes('http')) return 'LINK';
  if (content.length > 500) 'ARTICLE';

  return 'TEXT_ONLY'; // catch-all
};

const _metadata = (
  mainContentFocus: 'TEXT_ONLY' | 'IMAGE' | 'VIDEO' | 'LIVESTREAM' | 'AUDIO' | 'ARTICLE' | 'LINK',
  content: string,
  attachments: any[],
  profileDisplayName: string,
  livestreamConfig?: LivestreamConfig
) => {
  switch (mainContentFocus) {
    case 'TEXT_ONLY': return textOnly({ content, appId: APP_ID, marketplace: getMarketplaceData(profileDisplayName) });
    case 'IMAGE': {
      if (attachments.length === 1) {
        return image({
          content: content,
          image: attachments[0],
          appId: APP_ID,
          marketplace: getMarketplaceData(profileDisplayName)
        });
      } else {
        return image({
          title: content,
          image: attachments[0],
          attachments: attachments.slice(1),
          appId: APP_ID,
          marketplace: getMarketplaceData(profileDisplayName)
        });
      }
    }
    case 'VIDEO': return video({
      content,
      video: attachments[0],
      appId: APP_ID,
      marketplace: getMarketplaceData(profileDisplayName)
    });
    case 'LIVESTREAM': return liveStream({
      title: livestreamConfig!.title,
      content,
      liveUrl: livestreamConfig!.playbackUrl,
      playbackUrl: livestreamConfig!.playbackUrl, // TODO: maybe with storj recording
      startsAt: livestreamConfig!.startsAt || convertSecondsToISODate(Math.floor(Date.now() / 1000)),
      endsAt: livestreamConfig!.endsAt,
      appId: APP_ID,
      marketplace: getMarketplaceData(profileDisplayName)
    });
    case 'AUDIO': return audio({
      title: content,
      audio: {
        ...attachments[0],
        artist: profileDisplayName
      },
      appId: APP_ID,
      marketplace: getMarketplaceData(profileDisplayName)
    });
    case 'ARTICLE': return article({
      content,
      attachments,
      appId: APP_ID,
      marketplace: getMarketplaceData(profileDisplayName)
    });
    case 'LINK': return link(getLinkData(content, profileDisplayName));
  }
};

const publicationBody = (
  publicationContent: string,
  attachments: any[],
  profileDisplayName: string,
  livestreamConfig?: LivestreamConfig
) => {
  let mimeType = null;

  if (attachments.length > 0) {
    mimeType = attachments[0]?.type || attachments[0]?.mimeType;
    attachments = attachments.map((a) => ({ ...a, license: MetadataLicenseType.CCO }));
  }

  const mainContentFocus = _mainContentFocus(publicationContent, mimeType, !!livestreamConfig?.playbackUrl);

  // if it's a video or audio and we have more than two attachments, use the second one as the cover photo
  if ((mainContentFocus === 'VIDEO' || mainContentFocus === 'AUDIO') && attachments.length >= 2) {
    attachments[0].cover = attachments[1].item;
  }

  // format for Lens metadata v3
  const metadata = _metadata(
    mainContentFocus,
    trimify(publicationContent), // TODO: make sure this trims as expected
    attachments,
    profileDisplayName,
    livestreamConfig
  );

  if (!metadata) throw new Error('Bad metadata');

  PublicationMetadataSchema.parse(metadata); // sanity check

  return metadata;
};

export default publicationBody;
