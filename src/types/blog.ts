export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  category: string | null;
  language: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostRequest {
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  category: string | null;
  language: string;
  isPublished: boolean;
  publishedAt: string | null;
}

export type UpdateBlogPostRequest = CreateBlogPostRequest;
