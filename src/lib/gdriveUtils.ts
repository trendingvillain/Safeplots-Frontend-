// lib/gdriveUtils.ts

export function isGDriveUrl(url: string): boolean {
  return !!url && url.includes('drive.google.com');
}

export function convertGDriveUrl(url: string): string {
  if (!url || !isGDriveUrl(url)) return url;

  let fileId: string | null = null;

  // Handles /file/d/ID/view and /file/d/ID/preview
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  } else {
    // Handles ?id=ID
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) fileId = idMatch[1];
  }

  // sz=w1000 requests a 1000px wide thumbnail (efficient and high quality)
  return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000` : url;
}