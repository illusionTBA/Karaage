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

// id: text("id").primaryKey(),
// title: text("title").notNull(),
// image: text("image").notNull(),
// animeId: text("animeId").notNull(),
// type: text("type").notNull(),
// description: text("description").notNull(),
// genres: text("genres").notNull(),
// released: text("released").notNull(),
// status: text("status").notNull(),

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

// id: text("id").primaryKey(),
// title: text("title").notNull(),
// number: integer("number").notNull(),
// episodeId: text("episodeId").notNull(),
// type: text("type").notNull(),
// animeId: text("animeId").references(() => anime.animeId),

export type GogoEpisode = {
  title: string;
  number: number;
  episodeId: string;
  type: "sub" | "dub";
  animeId: string;
};
