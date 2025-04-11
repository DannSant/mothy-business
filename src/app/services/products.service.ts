import { Injectable } from '@angular/core';
import { createClient, PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { Product } from '../interfaces/product.interface';
const SUPABASE_URL = 'https://chyckjftqxxkhmrqpmxu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoeWNramZ0cXh4a2htcnFwbXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MTA5MjYsImV4cCI6MjA1OTM4NjkyNn0.SIvErP5jGbAk9_be-mcJsEZIeNUFA6IG97BwFY8-tiM';

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
