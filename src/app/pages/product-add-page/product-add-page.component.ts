import {  Component, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { ToastComponent } from '../../components/toast/toast.component';
import { ProductsService } from '../../services/products.service';


@Component({
  selector: 'product-add-page',
  imports: [ToastComponent],
  templateUrl: './product-add-page.component.html',
})
export default class ProductAddPageComponent {

  name = signal('');
  price = signal<number | null>(null);
  message = signal('');

  isEditMode = signal(false);
  productId = signal<string | null>(null);

  @ViewChild(ToastComponent) toast!: ToastComponent;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  async addProduct() {

    const name = this.name().trim();
    const price = this.price();

    if (!name || price === null || price <= 0) {
      this.message.set('Please enter a valid name and price.');
      return;
    }

    if(this.isEditMode()){
      const productId = this.productId();
      if (!productId) {
        this.message.set('Product ID is missing.');
        return;
      }
      const error = await this.productsService.updateProduct(productId, this.name(), this.price() ?? 0);

      if (error) {
        console.error('Error updating product:', error);
        this.toast.show('Failed to update product.');
      } else {
        this.message.set('Product updated successfully!');
        this.name.set('');
        this.price.set(null);
        this.toast.show('Product updated successfully!');
        setTimeout(() => this.router.navigate(['/products']), 3000);
      }
    }else {
      const  error  = await this.productsService.addProduct(this.name(), this.price()??0);

      if (error) {
        console.error('Error adding product:', error);
        this.toast.show('Failed to add product.');
      } else {
        this.message.set('Product added successfully!');
        this.name.set('');
        this.price.set(null);
        this.toast.show('Product added successfully!');
        setTimeout(() => this.router.navigate(['/products']), 3000);
      }
    }
  }

  async loadProduct(id:string){
    const {data,error } = await this.productsService.loadProduct(id);
    if (error || !data) {
      this.message.set('Failed to load product.');
      console.error(error);
      return;
    }
    this.name.set(data.name);
    this.price.set(data.price);
  }
}
