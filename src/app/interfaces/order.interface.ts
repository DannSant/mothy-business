import { OrderDetail } from "./order-detail.interface";

export enum OrderStatus{
  NEW='new', //recien creada y solicitada
  REQUESTED = 'requested', //se mandó la orden al proveedor
  PAID = 'paid', //se pagó la orden
  SHIPPED = 'shipped', //se mandó la orden al cliente
  DELIVERED = 'delivered', //se entregó la orden al cliente
  CANCELLED = 'cancelled', //se canceló la orden
}

export interface Order {
  id: string;
  products: OrderDetail[];
  totalPriceUsd: number;
  totalPriceMxn: number;
  shippingPriceMxn: number;
  createdAt: Date;
  status: OrderStatus;
  clientName:string;
  clientEmail?:string;
  currentExchange?:number;
}

