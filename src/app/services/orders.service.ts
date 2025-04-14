import { Injectable } from '@angular/core';
import { SupabaseClient, createClient, PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js';
import { Order, OrderStatus } from '../interfaces/order.interface';
import { OrderDetail } from '../interfaces/order-detail.interface';
import { environment } from '../../environments/environment';

const SUPABASE_URL = environment.supabaseUrl;
const SUPABASE_KEY = environment.supabaseKey;

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private supabase: SupabaseClient;

  constructor() {

    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  // Fetch all orders with their details
  async getOrders(): Promise<{data:Order[], error:PostgrestError | null}> {
    const { data: orders, error: ordersError } = await this.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      const emptyOrders: Order[] = [];
      return { data: emptyOrders, error: ordersError };
    }

    // For each order, fetch the associated order details
    for (let order of orders) {
      const { data: orderDetails, error: detailsError } = await this.supabase
        .from('order_details')
        .select('*')
        .eq('order_id', order.id);

      if (detailsError) {
        return { data: [], error: detailsError };
      }

      order.products = orderDetails as OrderDetail[];
    }

    return { data: orders.map(order=>({
      ...order,
      clientName: order.client_name,
      clientEmail: order.client_email,
      totalPriceUsd: order.total_price_usd,
      totalPriceMxn: order.total_price_mxn,
      shippingPriceMxn: order.shipping_price_mxn,
      createdAt: order.created_at,
    })), error: null };
  }

  //Add a new order
  async addOrder(order: Partial<Order>): Promise<{ data: Order | null; error: PostgrestError | null }> {
    const { data, error } = await this.supabase
      .from('orders')
      .insert([{
        client_name: order.clientName,
        client_email: order.clientEmail,
        created_at: new Date(),
        status: OrderStatus.NEW
      }])
      .select()
      .single();

    return { data: data as Order, error };
  }

  // Add order details to an existing order
  async addDetailToOrder(orderId: string, detail: Omit<OrderDetail, 'detaildId'>): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.supabase
      .from('order_details')
      .insert([
        {
          ...detail,
          order_id: orderId,
        }
      ]);

    return { error };
  }

  // Update an existing order
  async updateOrder(
    orderId: string,
    changes: Partial<Order>
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.supabase
      .from('orders')
      .update({
        client_name: changes.clientName,
        client_email: changes.clientEmail,
        shipping_price_mxn: changes.shippingPriceMxn,
        total_price_usd: changes.totalPriceUsd,
        total_price_mxn: changes.totalPriceMxn,
        status: changes.status,
        current_exchange: changes.currentExchange
      })
      .eq('id', orderId);

    return { error };
  }

  async updateOrderDetail(
    orderId: string,
    detailId: string,
    changes: Partial<OrderDetail>
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.supabase
      .from('order_details')
      .update(changes)
      .eq('order_id', orderId)
      .eq('detaildId', detailId);

    return { error };
  }

  // Delete an order
  async deleteOrder(orderId: string): Promise<{ error: PostgrestError | null }> {
    // Step 1: Delete all associated order details
    const { error: detailsError } = await this.supabase
      .from('order_details')
      .delete()
      .eq('order_id', orderId);

    if (detailsError) {
      return { error: detailsError };
    }

    // Step 2: Delete the order itself
    const { error: orderError } = await this.supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    return { error: orderError };
  }

  async deleteOrderDetail(orderId: string, detailId: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.supabase
      .from('order_details')
      .delete()
      .eq('order_id', orderId)
      .eq('detaildId', detailId);

    return { error };
  }

  // Get a specific order by ID
  async loadOrder(orderId: string): Promise<{ data: Order | null; error: PostgrestError | null }> {
    // Step 1: Fetch the main order
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { data: null, error: orderError };
    }

    // Step 2: Fetch order details
    const { data: orderDetails, error: detailsError } = await this.supabase
      .from('order_details')
      .select('*')
      .eq('order_id', orderId);

    if (detailsError) {
      return { data: null, error: detailsError };
    }

    // Step 3: Attach details to the order
    order.products = orderDetails as OrderDetail[];

    return {
      data: {
        clientName: order.client_name,
        clientEmail: order.client_email,
        totalPriceUsd: order.total_price_usd,
        totalPriceMxn: order.total_price_mxn,
        shippingPriceMxn: order.shipping_price_mxn,
        createdAt: new Date(order.created_at),
        status: order.status,
        currentExchange:order.current_exchange,
        products: order.products.map((product:any)=>({
          ...product,
          productId: product.product_id,
          orderId: product.order_id,
          detailId: product.detail_id,
          earningsMxn: product.earnings_mxn,
          subtotalMxn: product.subtotal_mxn,
          priceUsd: product.price_usd,
          priceMxn: product.price_mxn,
          discountUsd: product.discount_usd,
          discountMxn: product.discount_mxn,
          taxUsd: product.tax_usd,
          taxMxn: product.tax_mxn
        })),
        id: order.id,
      } as Order,
      error: null,
    };
  }

  async saveDetailsToOrder(orderId: string, details: OrderDetail[]): Promise<{ error: PostgrestError | null }> {
    // First, delete existing order details for this order
    const { error: deleteError } = await this.supabase
      .from('order_details')
      .delete()
      .eq('order_id', orderId);

    if (deleteError) {
      return { error: deleteError };
    }

    // Then, insert the new order details.
    // Adjust the payload accordingly if your table expects certain foreign key fields (e.g., order_id).
    const newDetailsPayload = details.map(detail => ({
      // Do not include detailId if it's auto-generated,
      // otherwise, include it if you're managing IDs on the frontend.
      order_id: orderId,
      product_id: detail.productId,
      quantity: detail.quantity,
      price_usd: detail.priceUsd,
      price_mxn: detail.priceMxn,
      discount_usd: detail.discountUsd,
      discount_mxn: detail.discountMxn,
      tax_usd: detail.taxUsd,
      tax_mxn: detail.taxMxn,
      earnings_mxn: detail.earningsMxn,
      subtotal_mxn: detail.subtotalMxn,
    }));

    const { error: insertError } = await this.supabase
      .from('order_details')
      .insert(newDetailsPayload);

    return { error: insertError };
  }


}
