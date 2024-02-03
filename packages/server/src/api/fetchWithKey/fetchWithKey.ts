const KEY_PLACEHOLDER = '${KEY}';

export const fetchWithKey = async (
  encodedUrl: string,
  encodedKeyId: string,
  additionalQueryParams: Record<string, string> = {}
) => {
  if (!encodedUrl) {
    throw new Error('URL cannot be empty.');
  }
  if (!encodedKeyId) {
    throw new Error('Key ID cannot be empty.');
  }

  const decodedUrl = decodeURIComponent(encodedUrl);
  if (!decodedUrl.includes('${KEY}')) {
    throw new Error(`Placeholder \${KEY} not found in URL: ${decodedUrl}`);
  }

  const decodedKeyId = decodeURIComponent(encodedKeyId);
  const key = process.env[decodedKeyId];
  if (!key) {
    throw new Error(`Key not found for ID: ${decodedKeyId}`);
  }

  let populatedUrl = decodedUrl.replace(KEY_PLACEHOLDER, key);
  for (const [queryKey, queryValue] of Object.entries(additionalQueryParams)) {
    populatedUrl = populatedUrl.replace(`{${queryKey}}`, queryValue);
  }

  return await fetch(populatedUrl);
};
