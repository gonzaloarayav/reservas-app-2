export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  author: string;
  publishDate: Date;
  category: 'general' | 'tournament' | 'maintenance' | 'event' | 'announcement';
  featured: boolean;
}