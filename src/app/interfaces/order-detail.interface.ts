export interface OrderDetail {
  detaildId:string;
  orderId:string;
  productId:string;
  quantity: number;
  priceUsd: number;
  priceMxn: number;
  discountUsd: number;
  discountMxn: number;
  taxUsd: number;
  taxMxn: number;
  earningsMxn: number;
  subtotalMxn: number;
}
