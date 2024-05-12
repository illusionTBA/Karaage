import { load } from "cheerio";
import type {
  GogoCard,
  GogoEpisode,
  GogoInfo,
  GogoRecentReleases,
} from "../../types";
import { GogoTypes } from "../../types";
import db from "../../db";
import { anime } from "../../db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import CryptoJS from "crypto-js";
import crypto from "crypto";

crypto.Decipher;

class Gogoanime {
  private Ajax: string;
  public useDB: boolean = true;
  constructor(public url: string, useDB: boolean = true) {
    this.useDB = useDB;
    this.url = url;
    this.Ajax = "https://ajax.gogocdn.net";
  }

  public async getRecentReleases(
    page: number = 1,
    lang: GogoTypes = GogoTypes.sub
  ) {
    const result: GogoRecentReleases[] = [];
    const res = await fetch(
      `${this.Ajax}/ajax/page-recent-release.html?page=${page}&type=${lang}`
    );
    const $ = load(await res.text());

    $(`div.last_episodes > ul > li`).each((i, el) => {
      const title = $(el).find("p.name > a").text();
      const image = $(el).find("div.img > a > img").attr("src");
      const link = $(el).find("p.name > a").attr("href");
      result.push({
        title: title,
        image: image || "",
        link: link || "",
        type:
          lang === GogoTypes.sub
            ? "sub"
            : lang === GogoTypes.dub
            ? "dub"
            : "chinese",
      });
    });

    return result;
  }

  public async Search(term: string): Promise<GogoCard[]> {
    const result: GogoCard[] = [];
    const res = await fetch(`${this.url}/search.html?keyword=${term}`);
    const cards = await this.scrapeCard(await res.text());

    return cards;
  }

  public async getPopularAnime(page: number = 1): Promise<GogoCard[]> {
    const res = await fetch(`${this.url}/popular.html?page=${page}`);
    const cards = await this.scrapeCard(await res.text());

    return cards;
  }

  // Getting info on anime based on provided id

  public async getAnimeInfo(id: string) {
    const result: GogoInfo = {
      title: "",
      image: "",
      animeId: id, // Assuming id is the animeId
      type: "sub", // Assuming default type is "sub"
      description: "",
      genres: [],
      released: "",
      status: "",
      episodes: [],
    };

    if (this.useDB) {
      const animeInfo = await db
        .select()
        .from(anime)
        .where(eq(anime.animeId, id));
      if (animeInfo.length > 0) {
        return {
          ...animeInfo[0],
          genres: JSON.parse(animeInfo[0].genres),
          episodes: JSON.parse(animeInfo[0].episodes),
        };
      }
    }

    const res = await fetch(`${this.url}/category/${id}`);
    const $ = load(await res.text());
    const container = $(
      "html body div#wrapper_inside div#wrapper div#wrapper_bg section.content section.content_left div.main_body div.anime_info_body div.anime_info_body_bg"
    );
    const title = $(container).find("h1").text();

    const image = $(container).find("img").attr("src");
    const description = $(container).find("div.description").text();
    /* Genres */
    $(container)
      .find("p.type:nth-child(7) a")
      .each((i, el) => {
        result.genres.push($(el).attr("title") || $(el).text());
      });

    const released = $(container)
      .find("p.type:nth-child(8)")
      .text()
      .replace("Released: ", "");

    const status = $(container).find("p.type:nth-child(9)").find("a").text();
    result.title = title;
    result.image = image || "";
    result.description = description || "";
    result.released = released || "???";
    result.status = status || "???";
    result.type = result.genres.includes("Dub") ? "dub" : "sub";
    const movie_id = $(
      "html body div#wrapper_inside div#wrapper div#wrapper_bg section.content section.content_left div.main_body div.anime_info_body div.anime_info_episodes div.anime_info_episodes_next input#movie_id.movie_id"
    ).attr("value");
    const alias = $(
      "html body div#wrapper_inside div#wrapper div#wrapper_bg section.content section.content_left div.main_body div.anime_info_body div.anime_info_episodes div.anime_info_episodes_next input#alias_anime.alias_anime"
    ).attr("value");
    const episodesAjax = await fetch(
      `${this.Ajax}/ajax/load-list-episode?ep_start=0&ep_end=999999999&id=${movie_id}&default_ep=0&alias=${alias}`
    );

    const $$ = load(await episodesAjax.text());

    $$("html body ul#episode_related li").each((i, el) => {
      const title = $$(el).find("a > div.name").text();
      const number = Number(
        $$(el).find("a > div.name").text().replace("EP ", "")
      );
      const episode_id = $$("a").attr("href")?.replace("/", "").trim() || "";
      result.episodes.push({
        title: title,
        number: number,
        episodeId: episode_id,
        type: "sub",
        animeId: id,
      });
    });
    if (status === "Completed" && this.useDB) {
      const dbresult = await db
        .select()
        .from(anime)
        .where(eq(anime.animeId, id));
      if (dbresult.length === 0) {
        await db.insert(anime).values({
          id: nanoid(),
          title: title,
          animeId: id,
          image: image || "",
          description: description || "",
          genres: JSON.stringify(result.genres),
          released: released || "???",
          status: status || "???",
          type: result.type,
          episodes: JSON.stringify(result.episodes),
        });
      }
    }

    return result;
  }

  // Get episodes source based on episode id
  public async getEpisodeSource(episodeId: string) {
    if (!episodeId) {
      throw new Error("Episode ID is required");
    }
    try {
      const res = await fetch(`${this.url}/${episodeId}`);

      const $ = load(await res.text());

      const url = new URL(
        $(
          "html body div#wrapper_inside div#wrapper div#wrapper_bg section.content section.content_left div.main_body div.anime_video_body div.anime_muti_link > ul > li.anime > a"
        ).attr("data-video")!
      );

      const sp = await fetch(url.href);

      const $$ = load(await sp.text());

      const iv = CryptoJS.enc.Utf8.parse(
        $$("div[class*='container-']").attr("class")?.split("-").pop() || ""
      );
      const enc = $$(`script[data-name="episode"]`).attr("data-value") || "";
      const key = CryptoJS.enc.Utf8.parse(
        $$("body[class^='container-']").attr("class")?.split("-").pop() || ""
      );
      const step1 = CryptoJS.AES.decrypt(enc, key, {
        iv: iv,
      });
      var step2 = CryptoJS.enc.Utf8.stringify(step1);

      var step3 = step2.substr(0, step2.indexOf("&"));

      const id =
        CryptoJS.AES.encrypt(step3, key, {
          iv: iv,
        }).toString() +
        step2.substring(step2.indexOf("&")) +
        `&alias=${step3}`;

      const data = await fetch(`${url.origin}/encrypt-ajax.php?id=${id}`, {
        headers: {
          "x-requested-with": "XMLHttpRequest",
        },
      }).then((res) => res.json());

      const sourcesKey = $$("div[class*='videocontent-']")
        .attr("class")
        ?.split("-")
        .pop();

      const sources = JSON.parse(
        CryptoJS.enc.Utf8.stringify(
          CryptoJS.AES.decrypt(
            data.data,
            CryptoJS.enc.Utf8.parse(sourcesKey || ""),
            {
              iv: iv,
            }
          )
        )
      );
      delete sources.advertising;
      delete sources.linkiframe;
      return {
        ...sources,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  private async scrapeCard(html: string): Promise<GogoCard[]> {
    const result: GogoCard[] = [];
    const $ = load(html);

    $(
      "html body div#wrapper_inside div#wrapper div#wrapper_bg section.content section.content_left div.main_body div.last_episodes ul.items li"
    ).each((i, el) => {
      const title = $(el).find("p.name > a").text();
      const image = $(el).find("div.img > a > img").attr("src");
      const id = $(el)
        .find("p.name > a")
        .attr("href")
        ?.replace("/category/", "");
      const released = $(el)
        .find("p.released")
        .text()
        .replace("Released: ", "")
        .trim();
      result.push({
        id: id || "",
        title: title,
        image: image || "",
        released,
      });
    });

    return result;
  }
}

export default Gogoanime;
