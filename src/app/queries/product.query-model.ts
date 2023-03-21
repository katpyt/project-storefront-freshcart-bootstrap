export interface ProductQueryModel {
  readonly id: string;
  readonly name: string;
  readonly fixedPrice: number;
  readonly categoryId: string;
  readonly ratingValue: number;
  readonly ratingCount: number;
  readonly ratingStars: string[];
  readonly imageUrl: string;
}
