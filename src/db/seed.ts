import { load } from "cheerio";
import db from "./index";
import { GogoTypes } from "../types";
import Gogoanime from "../lib/gogoanime";
import { anime } from "./schema";
import { nanoid } from "nanoid";

const base = "https://gogoanime3.co";
const gogo = new Gogoanime(base, false);
for (let i = 0; i < 624; i++) {
  const res = await fetch(`${base}/completed-anime.html?page=${i + 1}`);

  const $ = load(await res.text());

  const ids: string[] = [];

  $(
    "html body div#wrapper_inside div#wrapper div#wrapper_bg section.content section.content_left div.main_body div.last_episodes ul.items > li"
  ).each((i, el) => {
    const id = $(el).find("p.name > a").attr("href")?.replace("/category/", "");
    if (id) {
      ids.push(id);
    }
  });

  console.log(
    `Got ${ids.length} ids from page ${i + 1} adding them to db in 200ms`
  );
  Bun.sleep(200);
  const promises = ids.map((id) => gogo.getAnimeInfo(id));

  await Promise.all(promises).then((data) => {
    data.forEach((d) => {
      db.insert(anime)
        .values({
          id: nanoid(),
          title: d.title,
          image: d.image,
          animeId: d.animeId,
          type: d.type,
          description: d.description,
          genres: JSON.stringify(d.genres),
          released: d.released,
          status: d.status,
          episodes: JSON.stringify(d.episodes),
        })
        .then(() => console.log(`Added ${d.title}`));
    });
  });

  console.log(`Finished page ${i + 1}`);
  promises.length = 0;
  ids.length = 0;
  Bun.sleep(300);
}

console.log(
  "\n=====================\nFinished seeding\n=======================\n"
);
