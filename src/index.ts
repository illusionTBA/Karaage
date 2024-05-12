import Gogoanime from "./lib/gogoanime";
import { GogoTypes } from "./types";
import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
const gogo = new Gogoanime(
  Bun.env.GOGOANIME_URL || "https://gogoanime3.co",
  Boolean(Bun.env.USE_DB) || true
);

const server = new Elysia()
  .use(
    swagger({
      scalarConfig: {
        metaData: {
          author: "karaage",
        },
        theme: "purple",
      },
      documentation: {
        info: {
          title: "Karaage API Documentation",
          version: "1.0.0",
        },
      },
    })
  )
  .get(
    "/",
    () => {
      return {
        message: "Welcome to The Karaage 🐔 api",
        info: "You can view docs at /swagger",
      };
    },
    {
      detail: {
        responses: {
          200: {
            content: {
              "application/json": {
                example: "Welcome to Karaage 🐔 api",
                encoding: {},
              },
            },
            description: "A Welcome message to the api",
          },
        },
      },
    }
  )
  .get("/search", async ({ query: { term } }) => {
    if (!term) {
      return {
        message: "Please provide a search term",
      };
    }
    return await gogo.Search(term);
  })
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
            description:
              "Provides information about an episode from the gogoanime site.",
          },
        },
      },
    }
  )
  .listen(Bun.env.PORT || 3000);

console.log(`Karaage 🐔 api Listening on ${server.server?.url} `);
