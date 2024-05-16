export enum GogoTypes {
  sub = 1,
  dub = 2,
  chinese = 3,
}

export type GogoRecentReleases = {
  title: string;
  image: string;
  link: string;
  type: "sub" | "dub" | "chinese";
};

export type GogoInfo = {
  title: string;
  image: string;
  animeId: string;
  type: "sub" | "dub";
  description: string;
  genres: string[];
  released: string;
  status: string;
  episodes: GogoEpisode[];
};

export type GogoCard = {
  id: string;
  title: string;
  image: string;
  released: string;
};

export type GogoEpisode = {
  title: string;
  number: number;
  episodeId: string;
  type: "sub" | "dub";
  animeId: string;
};
