export class OlxAd {
  olxId: string;
  name: string;
  price: number;
  url: string;
  categoryName: string;

  constructor(data: {
    olxId: string;
    name: string;
    price: number;
    url: string;
    categoryName: string;
  }) {
    this.olxId = data.olxId;
    this.name = data.name;
    this.price = data.price;
    this.url = data.url;
    this.categoryName = data.categoryName;
  }
}
