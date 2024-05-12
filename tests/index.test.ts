import { expect, test } from "bun:test";

import Gogoanime from "../src/lib/gogoanime";

test("Gogoanime Info", async () => {
  const gogo = new Gogoanime("https://gogoanime3.co");

  const result = await gogo.getAnimeInfo("shingeki-no-kyojin");

  expect(result).toBeTruthy();
});
