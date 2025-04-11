import { Injectable } from '@angular/core';
import { createClient, PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { Product } from '../interfaces/product.interface';
import { environment } from '../../environments/environment';

const SUPABASE_URL = environment.supabaseUrl;
const SUPABASE_KEY = environment.supabaseKey;
@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private supabase: SupabaseClient;

    constructor() {
      this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    // Example methods
    async getProducts(): Promise<PostgrestSingleResponse<Product[]>> {
      return this.supabase.from('products').select('*');
    }

    async signIn(email: string, password: string) {
      return this.supabase.auth.signInWithPassword({ email, password });
    }

    async signOut() {
      return this.supabase.auth.signOut();
    }

    async addProduct(name: string, price: number) {
      const { error } = await this.supabase
        .from('products')
        .insert([{
          name: name,
          price: price,
        }]);
      return error;
    }

    async updateProduct(productId: string, name: string, price: number) {
      const { error } = await this.supabase
        .from('products')
        .update({ name, price })
        .eq('id', productId);

      return error;
    }

    async deleteProduct(productId: string) {
      const { error } = await this.supabase
        .from('products')
        .delete()
        .eq('id', productId);

      return error;
    }

    async loadProduct(id: string): Promise<{ data: Product, error: any }> {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      return {
        data,
        error
      }
    }

}
