import { LinkPreview } from '../types/journal';

export const fetchLinkPreview = async (url: string): Promise<LinkPreview> => {
  // Since we can't make CORS requests to arbitrary domains in a client-side app,
  // we'll create a mock preview based on the URL
  const domain = extractDomain(url);
  
  return {
    title: `Link to ${domain}`,
    description: `Shared link from ${domain}`,
    favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    url: url
  };
};

export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

export const isValidUrl = (string: string): boolean => {
  try {
    const url = string.startsWith('http') ? string : `https://${string}`;
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
