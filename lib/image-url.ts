export function normalizeImageUrl(url: string): string {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) return "";

  // Lấy ID từ link chia sẻ Google Drive
  const driveMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);

  if (driveMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }

  return trimmedUrl;
}
