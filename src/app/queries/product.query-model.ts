export interface ProductQueryModel {
  readonly id: string;
  readonly name: string;
  readonly fixedPriceWithCurrency: number;
  readonly categoryId: string;
  readonly ratingValue: number;
  readonly ratingCount: number;
  readonly ratingStars: string[];
  readonly imageUrl: string;
  // readonly featureValue: number;
  // readonly storeIds: string[];
}
