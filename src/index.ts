import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { gogoanime } from "./routes";
import { cron, Patterns } from "@elysiajs/cron";
import { UpdateGogoanimeEpisodes } from "./cron";
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

  .use(
    cron({
      name: "UpdateDatabse",
      pattern: Patterns.everyMinutes(10),
      async run() {
        console.log(`[CRON] Updating Database...`);
        await UpdateGogoanimeEpisodes();
        console.log(`[CRON] Done Updating Database...`);
      },
    })
  )
  // Routes
  .use(gogoanime)
  //

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

  .listen(Bun.env.PORT || 3000);

console.log(`Karaage 🐔 api Listening on ${server.server?.url} `);
