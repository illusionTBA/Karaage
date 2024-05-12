import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const anime = sqliteTable(
  "anime",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    image: text("image").notNull(),
    animeId: text("animeId").notNull(),
    type: text("type").notNull(),
    description: text("description").notNull(),
    genres: text("genres").notNull(),
    released: text("released").notNull(),
    status: text("status").notNull(),
    episodes: text("episodes").notNull(),
  },
  (animes) => ({
    animeIdx: uniqueIndex("animeIdx").on(animes.animeId),
    idx: uniqueIndex("idx").on(animes.id),
  })
);
