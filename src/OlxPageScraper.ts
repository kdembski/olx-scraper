import axios from "axios";
import { JSDOM } from "jsdom";
import { OlxAd } from "@/OlxAd";
import { OlxAdBuilder } from "@/OlxAdBuilder";

export class OlxPageScraper {
  private _ads?: OlxAd[];
  private baseUrl = "https://www.olx.pl/";
  private query = "/?search%5Border%5D=created_at:desc";

  async scrapPlp(url: string) {
    const response = await axios.get(this.baseUrl + url + this.query);
    const dom = new JSDOM(response.data);
    const cards = [
      ...dom.window.document.querySelectorAll("div[data-testid='l-card']"),
    ];

    const ads = [];
    const builder = new OlxAdBuilder();

    for (const card of cards) {
      const featured = card.querySelector("[data-testid='adCard-featured']");
      if (featured) continue;

      await builder.build(card, url);
      if (!builder.ad) continue;

      ads.push(builder.ad);
    }

    this._ads = ads;
    return this;
  }

  get ads() {
    return this._ads;
  }
}
