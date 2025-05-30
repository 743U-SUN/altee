# AI Developer Prompt Guide

This file contains instructions for AI developers to perform specific tasks.

## Image Delivery System: Convert to Proxy Method

### Background and Necessity

Currently, this project caches Amazon images to MinIO and users' browsers directly access MinIO (localhost:9000) to display images. We plan to migrate to Sakura Internet's Object Storage in the future, but the current direct link method has the following problems:

#### Sakura Internet Pricing Structure
- **VPS <-> Object Storage**: Unlimited transfer (within same region)
- **Internet <-> Object Storage**: Transfer fees apply

#### Current Problem
```
User Browser -> Object Storage (Transfer fees charged)
```

#### Ideal Configuration
```
User Browser -> VPS (Next.js) -> Object Storage (Free transfer)
```

### Implementation Requirements

#### 1. Create Image Proxy API
Create `/app/api/images/[...path]/route.ts` with the following features:

- **Path example**: `/api/images/cached-images/abc123.jpg`
- **Processing**:
  1. Build MinIO/Object Storage object key from path
  2. Fetch image from Object Storage on server-side
  3. Set appropriate Content-Type headers
  4. Set cache headers (Browser Cache + CDN support)
  5. Stream image response

- **Cache Strategy**:
  ```typescript
  headers: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Type': 'image/jpeg' // appropriate MIME type
  }
  ```

#### 2. Create Image URL Conversion Utility
Create `/lib/utils/image-proxy.ts`:

```typescript
// Before: http://localhost:9000/altee-uploads/cached-images/abc123.jpg
// After: /api/images/cached-images/abc123.jpg
export function convertToProxyUrl(minioUrl: string): string
```

#### 3. Update All Image Display Locations

**Target Files (must check and update)**:
- `/components/devices/UnifiedDeviceCard.tsx`
- `/app/(admin)/admin/devices/components/AddProductDialog.tsx`
- `/app/(admin)/admin/devices/components/ProductCard.tsx`
- `/app/(admin)/admin/devices/components/ColorImageManager.tsx`
- All other locations using MinIO URLs in `img` tags or `Image` components

**How to change**:
1. Use `convertToProxyUrl()` to convert URLs in each component
2. Update MinIO URL detection conditions
3. Set up proper error handling

#### 4. Environment Configuration
- **Development**: MinIO (localhost:9000)
- **Production**: Sakura Object Storage

Make it switchable with environment variables:
```env
OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_REGION=
```

### Implementation Steps

1. **Implement Image Proxy API**
   - Create `/app/api/images/[...path]/route.ts`
   - Image retrieval processing using MinIO/S3 client
   - Set appropriate HTTP headers

2. **Implement Utility Functions**
   - URL conversion logic
   - Environment-specific configuration support

3. **Update All Image Display Locations**
   - Use Grep to find all files containing `localhost:9000`
   - Change each file to use proxy URLs
   - Support both `img` tags and `Image` components

4. **Testing**
   - Verify image display functionality
   - Validate cache headers
   - Check error handling

### Important Notes

- **Current image URL format**: `http://localhost:9000/altee-uploads/xxx`
- **New format**: `/api/images/xxx`
- **MinIO settings**: Need to verify image access permissions
- **Performance**: Server-side streaming processing should not cause significant delays

### Benefits After Completion

1. **Cost Reduction**: Avoid Sakura Object Storage transfer fees
2. **Access Control**: Can add authentication and permission checks if needed
3. **Monitoring/Logging**: Possible to log image access
4. **CDN Ready**: Preparation complete for future CDN implementation

This change will maximize the benefits of unlimited transfer between Sakura Internet's VPS and Object Storage.

### How to Use This Guide

When instructing AI next time, use:

```
Follow the instructions in the "Image Delivery System: Convert to Proxy Method" section of docs/ai_prompt_guide.md to convert all image displays in the project to proxy method. Implement it to benefit from Sakura Object Storage's unlimited transfer policy.
```