export type Profile = {
  id: number;
  user_id: number;
  name: string;
  avatar_url: string | null;
  maturity_rating: string;
  created_at: string;
};

export type ProfileCreateInput = {
  name: string;
  avatar_url?: string | null;
  maturity_rating?: string;
};