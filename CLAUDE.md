# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production version
- `npm run lint` - Run ESLint for code quality checks
- `npm run start` - Start production server
- `npm run create-admin` - Create admin user (requires manual execution)
- `npm run list-users` - List existing users

## Architecture Overview

This is a Next.js 15 application using the App Router with a multi-tenant user profile system and device management platform.

### Core Technology Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL with Prisma ORM (client generated in lib/generated/prisma)
- **Authentication**: NextAuth.js v5 with JWT sessions (Google/Discord providers)
- **File Storage**: MinIO (S3-compatible) for user uploads
- **UI Framework**: Tailwind CSS + Radix UI components
- **State Management**: Zustand for client-side state
- **Form Handling**: React Hook Form + Zod validation

### Application Structure

The app uses Next.js route groups for organization:

- `(root)` - Landing page
- `(admin)` - Admin panel for managing products, articles, links, and users
- `(user)` - User dashboard for profile management, devices, favorites
- `(handle)/[handle]` - Public user profile pages (like GitHub profiles)
- `(device)` - Public device catalog and browsing
- `(article)` - Article/blog system
- `(sample)` - Sample/demo pages

### Key Features

1. **User Profile System**: Users get unique handles (like @username) with customizable profile pages including bio, links, images, YouTube integration, and Q&A sections.

2. **Device Management**: Two-tier system with admin-curated products and user personal device collections. Supports Amazon affiliate links and custom device entries.

3. **Article System**: Full CMS with categories, tags, comments, and author management.

4. **Link Management**: Customizable social/service links with icon management and drag-drop reordering.

### Database Schema Notes

- Generated Prisma client is in `lib/generated/prisma` (not the default location)
- Uses PostgreSQL with comprehensive indexing
- Supports both official products (admin-managed) and custom user devices
- Complex relationships between users, profiles, links, devices, and content

### File Upload System

Uses MinIO for S3-compatible storage:
- User avatars, banners, carousel images
- Article featured images
- Service icons
- Device images
- Configured for local development (localhost:9000) and Docker (minio:9000)

### Authentication Flow

NextAuth.js v5 with edge-compatible JWT sessions:
- Google and Discord OAuth providers
- Role-based access (user/admin)
- User sync happens after authentication
- Session strategy optimized for edge runtime

### Development Notes

- Uses `npm run dev` with Turbopack for fast development
- Prisma schema includes Japanese comments for device management
- Image optimization configured for Amazon CDN domains
- SVG sanitization for security
- Secure form handling with validation
