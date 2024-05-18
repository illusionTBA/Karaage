// TODO:
// Implement scraper to get frontcard pages and

import Gogoanime from "../lib/gogoanime";
import db from "../db";
import { anime as TB_ANIME } from "../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { GogoCard, GogoEpisode } from "../types";
const gogo = new Gogoanime(
  Bun.env.GOGOANIME_URL || "https://gogoanime3.co",
  false,
  false
);

const UpdateEpisodes = async () => {
  const now = Date.now();
  try {
    const res = await fetch(`${Bun.env.GOGOANIME_URL}`);

    const cards = await gogo.scrapeCard(await res.text());

    //   const card = { ...cards[0], id: cards[0].id.substring(1) };
    const promises = [];
    for (const card of cards) {
      promises.push(getData(card));
    }

    await Promise.all(promises);
  } catch (error) {
    console.log(`[CRON] Error in UpdateGogoanimeEpisodes: ${error}`);
  }
  //   console.log("Done in", Date.now() - now, "ms");
};

if (import.meta.main) {
  UpdateEpisodes();
}

export default UpdateEpisodes;

const getData = async (card: GogoCard) => {
  const id = card.id.replace(/-episode-\d+/, "").substring(1);
  if (!id) return;

  const animes = await db
    .select()
    .from(TB_ANIME)
    .where(eq(TB_ANIME.animeId, id));
  if (animes.length === 0) {
    await insertIntoDB(id);
    return;
  }
  const anime = animes[0];
  const episodes: GogoEpisode[] = JSON.parse(anime.episodes);
  if (episodes[0].episodeId === card.id.substring(1)) {
    return;
  }
  const info = await gogo.getAnimeInfo(id);

  await db
    .update(TB_ANIME)
    .set({
      released: info.released,
      episodes: JSON.stringify(info.episodes),
    })
    .where(eq(TB_ANIME.animeId, id))
    .then(() => console.log(`[CRON] Updated ${info.title} in DB`))
    .catch((e) => {
      console.log(e);
    });
};

const insertIntoDB = async (id: string) => {
  const info = await gogo.getAnimeInfo(id);

  await db
    .insert(TB_ANIME)
    .values({
      id: nanoid(),
      title: info.title,
      image: info.image,
      animeId: info.animeId,
      type: info.type,
      description: info.description,
      genres: JSON.stringify(info.genres),
      released: info.released,
      status: info.status,
      episodes: JSON.stringify(info.episodes),
    })
    .then(() => console.log(`Inserted ${info.title} into DB`))
    .catch((e) => {
      console.error(`Error inserting ${id} into DB: ${e}`);
    });
};
