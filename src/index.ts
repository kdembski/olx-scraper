import { OlxPageScraper } from "@/OlxPageScraper";
import { OlxAd } from "@/OlxAd";
import { ApiService } from "@/ApiService";
import { WebSocketService } from "@/WebSocketService";
import { OlxAdCategory } from "@/types/olx.types";
import { configDotenv } from "dotenv";

configDotenv();

const run = async () => {
  const collectedAds: OlxAd[] = [];
  const scraper = new OlxPageScraper();
  const api = ApiService.getInstance();
  const categoryWs = new WebSocketService("olx/ads/categories");

  let categories = await api.get<OlxAdCategory[]>("olx/ads/categories");

  categoryWs.onmessage = (event) => {
    if (!event.data) return;
    categories = JSON.parse(event.data);
  };

  const getCategoryNames = () => categories.map((category) => category.name);

  setInterval(async () => {
    for (const category of getCategoryNames()) {
      try {
        await scraper.scrapPlp(category);
        const ad = scraper.ads?.[0];
        if (!ad) continue;

        const isNew = !collectedAds.some(
          (collected) => collected.olxId === ad.olxId
        );
        if (!isNew) return;

        console.log(ad);
        collectedAds.push(ad);
        await api.post("olx/ads", ad);

        if (collectedAds.length > 1000) {
          collectedAds.slice(900);
        }
      } catch (error: any) {
        console.error(error?.message);
      }
    }
  }, 500);
};

run();
