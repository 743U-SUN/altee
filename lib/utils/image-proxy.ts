/**
 * Image proxy utility functions
 * Converts MinIO/Object Storage URLs to proxy URLs for cost optimization
 */

/**
 * Convert MinIO/Object Storage URL to proxy URL
 * @param minioUrl - Original MinIO URL (e.g., http://localhost:9000/altee-uploads/cached-images/abc123.jpg)
 * @returns Proxy URL (e.g., /api/images/cached-images/abc123.jpg)
 */
export function convertToProxyUrl(minioUrl: string): string {
  if (!minioUrl) {
    return '';
  }

  // Check if already a proxy URL
  if (minioUrl.startsWith('/api/images/')) {
    return minioUrl;
  }

  // Check if it's a relative URL that doesn't need conversion
  if (minioUrl.startsWith('/') && !minioUrl.includes('://')) {
    return minioUrl;
  }

  try {
    // Parse the URL
    const url = new URL(minioUrl);
    
    // Check if it's a MinIO/Object Storage URL
    const isMinioUrl = 
      url.hostname === 'localhost' && url.port === '9000' ||
      url.hostname === 'minio' && url.port === '9000' ||
      url.hostname.includes('object-storage') ||
      url.hostname.includes('s3');

    if (!isMinioUrl) {
      // Not a MinIO URL, return as is
      return minioUrl;
    }

    // Extract the path after the bucket name
    // Expected format: /bucket-name/path/to/file.jpg
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2) {
      // Invalid path format
      return minioUrl;
    }

    // Remove the bucket name (first part) and join the rest
    const bucketName = pathParts[0];
    const objectPath = pathParts.slice(1).join('/');

    // For now, we assume 'altee-uploads' as the bucket name
    // In the future, this could be configurable
    if (bucketName === 'altee-uploads') {
      return `/api/images/${objectPath}`;
    }

    // For other buckets, include the bucket name in the path
    return `/api/images/${bucketName}/${objectPath}`;
  } catch (error) {
    // If URL parsing fails, return the original URL
    console.error('Failed to parse MinIO URL:', error);
    return minioUrl;
  }
}

/**
 * Check if a URL is a MinIO/Object Storage URL
 * @param url - URL to check
 * @returns true if it's a MinIO URL
 */
export function isMinioUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return (
      (urlObj.hostname === 'localhost' && urlObj.port === '9000') ||
      (urlObj.hostname === 'minio' && urlObj.port === '9000') ||
      urlObj.hostname.includes('object-storage') ||
      urlObj.hostname.includes('s3')
    );
  } catch {
    return false;
  }
}

/**
 * Convert proxy URL back to MinIO URL (for debugging/testing)
 * @param proxyUrl - Proxy URL (e.g., /api/images/cached-images/abc123.jpg)
 * @param endpoint - MinIO endpoint (default: http://localhost:9000)
 * @param bucket - Bucket name (default: altee-uploads)
 * @returns MinIO URL
 */
export function convertFromProxyUrl(
  proxyUrl: string,
  endpoint: string = 'http://localhost:9000',
  bucket: string = 'altee-uploads'
): string {
  if (!proxyUrl || !proxyUrl.startsWith('/api/images/')) {
    return proxyUrl;
  }

  // Remove the /api/images/ prefix
  const path = proxyUrl.replace('/api/images/', '');
  
  // Construct the MinIO URL
  return `${endpoint}/${bucket}/${path}`;
}

/**
 * Get the bucket name and object path from a proxy URL
 * @param proxyUrl - Proxy URL
 * @returns Object with bucket and path, or null if invalid
 */
export function parseProxyUrl(proxyUrl: string): { bucket: string; path: string } | null {
  if (!proxyUrl || !proxyUrl.startsWith('/api/images/')) {
    return null;
  }

  const fullPath = proxyUrl.replace('/api/images/', '');
  const parts = fullPath.split('/');

  // Check if the first part looks like a bucket name
  // If it matches known bucket patterns, treat it as a bucket
  const firstPart = parts[0];
  if (firstPart && (firstPart.includes('-uploads') || firstPart.includes('-storage'))) {
    return {
      bucket: firstPart,
      path: parts.slice(1).join('/')
    };
  }

  // Otherwise, assume default bucket
  return {
    bucket: 'altee-uploads',
    path: fullPath
  };
}