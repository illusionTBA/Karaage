import { Elysia } from "elysia";
import { GogoTypes } from "../types";
import Gogoanime from "../lib/gogoanime";
import { t } from "elysia";
const gogo = new Gogoanime(
  Bun.env.GOGOANIME_URL || "https://gogoanime3.co",
  Boolean(Bun.env.USE_DB) || true,
  Boolean(Bun.env.REDIS_URL)
);

const gogoanime = new Elysia({ prefix: "/gogoanime" })
  .get(
    "/search",
    async ({ query: { term } }) => {
      if (!term) {
        return {
          message: "Please provide a search term",
        };
      }
      return await gogo.Search(term);
    },
    {
      detail: {
        tags: ["gogoanime"],
        responses: {
          200: {
            content: {
              "application/json": {
                example: [
                  {
                    id: "string",
                    title: "string",
                    image: "string",
                    released: "string",
                  },
                ],
              },
            },
            description: "Search anime from the gogoanime site.",
          },
        },
      },
    }
  )
  .get(
    "/recent",
    async ({ query: { page = 1, type = "" } }) => {
      if (type === "sub") {
        return await gogo.getRecentReleases(page, GogoTypes.sub);
      } else if (type === "dub") {
        return await gogo.getRecentReleases(page, GogoTypes.dub);
      } else if (type === "chinese") {
        return await gogo.getRecentReleases(page, GogoTypes.chinese);
      }

      const [sub, dub, chinese] = await Promise.all([
        gogo.getRecentReleases(page, GogoTypes.sub),
        gogo.getRecentReleases(page, GogoTypes.dub),
        gogo.getRecentReleases(page, GogoTypes.chinese),
      ]);

      return { sub, dub, chinese };
    },
    {
      query: t.Object({
        page: t.Numeric({ default: 1 }),
        type: t.Optional(t.String()),
      }),
      detail: {
        tags: ["gogoanime"],
        responses: {
          200: {
            content: {
              "application/json": {
                example: {
                  sub: [],
                  dub: [],
                  chinese: [],
                },
                encoding: {},
              },
            },
            description:
              "Provides recent releases from the gogoanime site in a json format.\nyou can also specify the type of release to get (sub, dub, chinese) as a query parameter.",
          },
        },
      },
    }
  )
  .get(
    "/popular",
    async ({ query: { page = 1 } }) => {
      return await gogo.getPopularAnime(page);
    },
    {
      detail: {
        tags: ["gogoanime"],

        responses: {
          200: {
            content: {
              "application/json": {
                example: [
                  {
                    id: "string",
                    title: "string",
                    image: "string",
                    released: "string",
                  },
                ],
                encoding: {},
              },
            },
            description:
              "Provides an array of popular anime from the gogoanime site.",
          },
        },
      },
      query: t.Object({ page: t.Numeric({ default: 1 }) }),
    }
  )
  .get(
    "/info/:id",
    async ({ params: { id } }) => {
      if (!id) {
        return { error: "Anime id is required" };
      }
      return await gogo.getAnimeInfo(id);
    },
    {
      detail: {
        tags: ["gogoanime"],

        responses: {
          200: {
            content: {
              "application/json": {
                example: {
                  title: "string",
                  image: "string",
                  animeId: "string",
                  type: "string",
                  description: "string",
                  genres: "string[]",
                  released: "string",
                  status: "string",
                  episodes: [
                    {
                      title: "string",
                      number: "number",
                      episodeId: "string",
                      type: "sub | dub",
                      animeId: "string",
                    },
                  ],
                },
                encoding: {},
              },
            },
            description:
              "Provides information about an anime from the gogoanime site including episodes.",
          },
        },
      },
    }
  )
  .get(
    "/watch/:id",
    async ({ params: { id } }) => {
      return await gogo.getEpisodeSource(id);
    },
    {
      detail: {
        tags: ["gogoanime"],

        responses: {
          200: {
            content: {
              "application/json": {
                example: {
                  source: [
                    {
                      file: "string",
                      label: "string",
                      type: "string",
                    },
                  ],
                  source_bk: [
                    {
                      file: "string",
                      label: "string",
                      type: "string",
                    },
                  ],
                  track: {
                    tracks: [
                      {
                        file: "string",
                        kind: "string",
                      },
                    ],
                  },
                },
                encoding: {},
              },
            },
            description: "Provides source links of the episode.",
          },
        },
      },
    }
  );

export default gogoanime;
