// User profile page types
export type UserProfileData = {
  id: string;
  handle: string | null;
  characterName: string | null;
  subname: string | null;
  bio: string | null;
  iconUrl: string | null;
  customQuestions: UserCustomQuestion[];
  links: UserLinkWithRelations[];
  youtubeSettings: UserYoutubeSettingsWithVideos | null;
};

export type UserCustomQuestion = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type UserLinkWithRelations = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  useOriginalIcon: boolean;
  originalIconUrl: string | null;
  service: {
    id: string;
    name: string;
    slug: string;
  };
  icon: {
    id: string;
    filePath: string;
    name: string;
  } | null;
};

export type UserYoutubeSettingsWithVideos = {
  id: string;
  channelId: string | null;
  displayCount: number;
  pickupVideo: string | null;
  videos: UserYoutubeVideo[];
};

export type UserYoutubeVideo = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  publishedAt: Date | string | null;
};
