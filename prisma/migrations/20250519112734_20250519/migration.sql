-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "characterName" TEXT,
    "subname" TEXT,
    "birthday" TIMESTAMP(3),
    "gender" TEXT,
    "iconUrl" TEXT,
    "handle" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "subscription_status" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLink" (
    "id" TEXT NOT NULL,
    "category" TEXT,
    "iconId" TEXT,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "linkTypeId" TEXT,

    CONSTRAINT "UserLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserYoutubeSettings" (
    "id" TEXT NOT NULL,
    "channelId" TEXT,
    "displayCount" INTEGER NOT NULL DEFAULT 3,
    "pickupVideo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserYoutubeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserImageBanner" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "imgUrl" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserImageBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserYoutubeVideo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "settingsId" TEXT NOT NULL,

    CONSTRAINT "UserYoutubeVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPopupSettings" (
    "id" TEXT NOT NULL,
    "bellTitle" TEXT,
    "bellText" TEXT,
    "bellImageUrl" TEXT,
    "bellUrl" TEXT,
    "bellLastUpdated" TIMESTAMP(3),
    "emailTitle" TEXT,
    "emailText" TEXT,
    "popup1ImageUrl" TEXT,
    "popup1Url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserPopupSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOGP" (
    "id" TEXT NOT NULL,
    "imgUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserOGP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCustomQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserCustomQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserImageCarousel" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "imgUrl" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserImageCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDisplaySettings" (
    "id" TEXT NOT NULL,
    "displayYoutube" BOOLEAN NOT NULL DEFAULT true,
    "displayDevice" BOOLEAN NOT NULL DEFAULT true,
    "displayFaq" BOOLEAN NOT NULL DEFAULT true,
    "displayPopup1" BOOLEAN NOT NULL DEFAULT true,
    "displayPopupBell" BOOLEAN NOT NULL DEFAULT true,
    "displayPopupEmail" BOOLEAN NOT NULL DEFAULT true,
    "displayUserList" BOOLEAN NOT NULL DEFAULT true,
    "displayOwnPage" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserDisplaySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icons" TEXT,

    CONSTRAINT "LinkType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "NotificationSettings_userId_idx" ON "NotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "UserLink_userId_idx" ON "UserLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserYoutubeSettings_userId_key" ON "UserYoutubeSettings"("userId");

-- CreateIndex
CREATE INDEX "UserYoutubeSettings_userId_idx" ON "UserYoutubeSettings"("userId");

-- CreateIndex
CREATE INDEX "UserImageBanner_userId_idx" ON "UserImageBanner"("userId");

-- CreateIndex
CREATE INDEX "UserYoutubeVideo_settingsId_idx" ON "UserYoutubeVideo"("settingsId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPopupSettings_userId_key" ON "UserPopupSettings"("userId");

-- CreateIndex
CREATE INDEX "UserPopupSettings_userId_idx" ON "UserPopupSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOGP_userId_key" ON "UserOGP"("userId");

-- CreateIndex
CREATE INDEX "UserOGP_userId_idx" ON "UserOGP"("userId");

-- CreateIndex
CREATE INDEX "UserCustomQuestion_userId_idx" ON "UserCustomQuestion"("userId");

-- CreateIndex
CREATE INDEX "UserImageCarousel_userId_idx" ON "UserImageCarousel"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDisplaySettings_userId_key" ON "UserDisplaySettings"("userId");

-- CreateIndex
CREATE INDEX "UserDisplaySettings_userId_idx" ON "UserDisplaySettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkType_slug_key" ON "LinkType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLink" ADD CONSTRAINT "UserLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLink" ADD CONSTRAINT "UserLink_linkTypeId_fkey" FOREIGN KEY ("linkTypeId") REFERENCES "LinkType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserYoutubeSettings" ADD CONSTRAINT "UserYoutubeSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImageBanner" ADD CONSTRAINT "UserImageBanner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserYoutubeVideo" ADD CONSTRAINT "UserYoutubeVideo_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "UserYoutubeSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPopupSettings" ADD CONSTRAINT "UserPopupSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOGP" ADD CONSTRAINT "UserOGP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCustomQuestion" ADD CONSTRAINT "UserCustomQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImageCarousel" ADD CONSTRAINT "UserImageCarousel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDisplaySettings" ADD CONSTRAINT "UserDisplaySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
