export type ProjectAuthor = {
  userId: number;
  name: string;
  profileImage: string;
};

export type ProjectMember = {
  userId: number;
  name: string;
};

export type ProjectSection = {
  sectionId: number;
  title: string;
  content: string;
  imageUrl?: string;
};

export type ProjectResource = {
  resourceId: number;
  title: string;
  href: string;
};

export type RelatedProject = {
  projectId: number;
  title: string;
  authorName: string;
  imageUrl: string;
};

export type ProjectDetail = {
  projectId: number;
  title: string;
  description: string;
  content: string;
  thumbnailUrl: string;
  author: ProjectAuthor;
  tags: string[];
  members: ProjectMember[];
  likes: number;
  views: number;
  isLiked: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  sections: ProjectSection[];
  resources: ProjectResource[];
  relatedWorks: RelatedProject[];
};
