import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product.interface';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products-page',
  imports: [CommonModule,RouterLink],
  templateUrl: './products-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductsPageComponent {

   // Use signal to manage product list
   products = signal<Product[]>([]);

  private productsService = inject(ProductsService);

   ngOnInit() {
     this.loadProducts();
   }

   async loadProducts() {
     const { data, error } = await this.productsService.getProducts();
     if (error) {
       console.error('Error loading products:', error);
     } else {
       // Update the signal with new data
       this.products.set(data);
     }
   }

   async deleteProduct(productId: string) {
    const error = await this.productsService.deleteProduct(productId);

    if (error) {
      console.error('Error deleting product:', error);
    } else {
      // Remove the product from the signal after deletion
      this.products.set(this.products().filter(p => p.id !== productId));
    }
   }
 }
