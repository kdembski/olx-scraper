import { OlxPageScraper } from "@/OlxPageScraper";
import { ApiService } from "@/ApiService";
import { WebSocketService } from "@/WebSocketService";
import { OlxAdCategory, OlxPlpAd } from "@/types/olx.types";
import { configDotenv } from "dotenv";

configDotenv();

const run = async () => {
  const collectedAds: OlxPlpAd[] = [];
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
        // Scrap all plp ads and take first one (newest)
        const plpAds = await scraper.scrapPlp(category);
        const plpAd = plpAds?.[0];
        if (!plpAd) continue;

        // Check if ad has been already scraped
        const isNew = !collectedAds.some(
          (collected) => collected.olxId === plpAd.olxId
        );
        if (!isNew) continue;

        // Scrap pdp of that ad
        const pdpAd = await scraper.scrapPdp(plpAd.url);
        if (!pdpAd) continue;

        // Build olx ad create input and send post request
        const ad = { ...plpAd, ...pdpAd };

        console.log(ad);
        collectedAds.push(ad);
        await api.post("olx/ads", ad);

        // Clean collected ads
        if (collectedAds.length > 1000) {
          collectedAds.slice(900);
        }
      } catch (error: any) {
        console.error(error?.message);
      }
    }
  }, 1000);
};

run();
