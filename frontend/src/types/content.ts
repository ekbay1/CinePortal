export type Genre = {
  id: number;
  name: string;
};

export type StreamingService = {
  id: number;
  name: string;
  logo_url: string | null;
};

export type ContentAvailability = {
  id: number;
  service: StreamingService;
  url: string | null;
  requires_addon: boolean;
};

export type Content = {
  id: number;
  title: string;
  description: string | null;
  content_type: string;
  release_year: number | null;
  maturity_rating: string | null;
  runtime_minutes: number | null;
  poster_url: string | null;
  trailer_url: string | null;
  is_original: boolean;
  created_at: string;
  genres: Genre[];
  availability: ContentAvailability[];
};

export type SearchResponse = {
  query: string | null;
  total: number;
  results: Content[];
};

export type HomepageRow = {
  title: string;
  items: Content[];
};

export type HomepageResponse = {
  rows: HomepageRow[];
};