import { OlxAd } from "@/OlxAd";

export class OlxAdBuilder {
  private _ad?: OlxAd;
  private baseUrl = "https://www.olx.pl";

  async build(card: Element, categoryName: string) {
    const name = card.querySelector("h6")?.textContent;
    const olxId = card.getAttribute("id");
    const url = card.querySelector("a")?.href;

    const price = parseInt(
      card
        .querySelector("[data-testid='ad-price']")
        ?.textContent?.split("zł")[0]
        .replaceAll(" ", "") || "0"
    );

    if (!name || !olxId || !url || !price) return this;

    this._ad = new OlxAd({
      olxId,
      name,
      price,
      url: this.baseUrl + url,
      categoryName,
    });

    return this;
  }

  get ad() {
    return this._ad;
  }
}
