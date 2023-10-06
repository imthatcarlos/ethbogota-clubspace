import { defaultGatewayURL, lensGatewayURL } from "@/utils";

export default ({ picture }) => {
  if (!picture) return '';

  if (picture.original?.url) {
    return picture.original.url.includes('https://')
      ? picture.original.url
      : lensGatewayURL(picture.original?.url);
  }

  return picture.uri.includes('https://')
    ? picture.uri
    : defaultGatewayURL(picture.uri);
};