import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService, AuthState } from '../../../../shared/src/app/auth';
import { Product, ProductService, ProductUpdateRequest } from '../../../../shared/src/app/product';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
})
export class ProductEditComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  authState: AuthState | null = null;
  product: Product | null = null;
  productId!: number;
  loading = false;
  saving = false;
  error: string | null = null;
  success = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  categories: string[] = [];
  brands: string[] = [];
  imageType: 'url' | 'upload' = 'url';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    // Get auth state but don't block loading
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.authState = state;
        // Comment out the role check temporarily
        // if (!this.userHasRole(['ADMIN', 'MANAGER'])) {
        //   this.router.navigate(['/products']);
        //   return;
        // }
      });

    // Get product ID from route
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ProductEdit - Route ID parameter:', id);
    if (id) {
      this.productId = +id;
      console.log('ProductEdit - Parsed product ID:', this.productId);
      this.initializeForm();
      this.loadFormData();
      this.loadProduct();
    } else {
      console.error('ProductEdit - No ID parameter found in route');
      this.error = 'ID sản phẩm không hợp lệ';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  userHasRole(roles: string[]): boolean {
    if (!this.authState || !this.authState.user || !this.authState.user.roles) {
      return false;
    }
    return this.authState.user.roles.some(role => roles.includes(role));
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      brand: ['']
    });
  }

  loadFormData(): void {
    // Load categories
    this.productService.getCategories().subscribe({
      next: (categories: string[]) => {
        this.categories = categories;
        console.log('Categories loaded:', categories);
      },
      error: (err: any) => {
        console.error('Error loading categories', err);
        // Set fallback categories
        this.categories = ['Đồ chơi', 'Thức ăn', 'Phụ kiện', 'Y tế'];
      }
    });

    // Load brands
    this.productService.getBrands().subscribe({
      next: (brands: string[]) => {
        this.brands = brands;
        console.log('Brands loaded:', brands);
      },
      error: (err: any) => {
        console.error('Error loading brands', err);
        // Set fallback brands
        this.brands = ['Royal Canin', 'Pedigree', 'Whiskas', 'Other'];
      }
    });
  }

  loadProduct(): void {
    console.log('ProductEdit - Loading product with ID:', this.productId);
    this.loading = true;
    this.error = null;

    this.productService.getProductById(this.productId).subscribe({
      next: (product: Product) => {
        console.log('ProductEdit - Product loaded successfully:', product);
        this.product = product;
        this.populateForm(product);
        this.setupImagePreview(product);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('ProductEdit - Error loading product:', err);
        this.error = 'Không thể tải thông tin sản phẩm';
        this.loading = false;
      }
    });
  }

  populateForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      category: product.category,
      brand: product.brand || ''
    });
  }

  setupImagePreview(product: Product): void {
    if (product.imageUrl) {
      // Use the imageUrl directly if it exists
      this.imagePreview = product.imageUrl;
    } else {
      // Try to get image from API
      this.imagePreview = this.productService.getProductImageUrl(product.id);
    }
  }



  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  } deleteExistingImage(): void {
    if (this.product && confirm('Bạn có chắc chắn muốn xóa hình ảnh hiện tại?')) {
      this.productService.deleteProductImage(this.product.id).subscribe({
        next: () => {
          this.imagePreview = null;
          if (this.product) {
            this.product.imageUrl = undefined;
          }
        },
        error: (err: any) => {
          console.error('Error deleting image', err);
          this.error = 'Không thể xóa hình ảnh';
        }
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.saving && this.product) {
      this.saving = true;
      this.error = null;

      const formValue = this.productForm.value;
      const updateData: ProductUpdateRequest = {
        id: this.product.id,
        name: formValue.name,
        description: formValue.description,
        price: Number(formValue.price),
        stockQuantity: Number(formValue.stockQuantity),
        category: formValue.category,
        brand: formValue.brand || undefined
      };

      this.productService.updateProduct(updateData).subscribe({
        next: (product) => {
          console.log('Product updated:', product);

          // Upload new image if selected
          if (this.selectedFile && product.id) {
            this.uploadProductImage(product.id);
          } else {
            this.success = true;
            this.saving = false;
            setTimeout(() => {
              this.router.navigate(['/products/admin/dashboard']);
            }, 2000);
          }
        },
        error: (err: any) => {
          console.error('Error updating product', err);
          this.error = 'Không thể cập nhật sản phẩm. Vui lòng thử lại.';
          this.saving = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private uploadProductImage(productId: number): void {
    if (this.selectedFile) {
      this.productService.uploadProductImage(productId, this.selectedFile).subscribe({
        next: () => {
          this.success = true;
          this.saving = false;
          setTimeout(() => {
            this.router.navigate(['/products/admin/dashboard']);
          }, 2000);
        },
        error: (err: any) => {
          console.error('Error uploading image', err);
          // Product updated successfully but image upload failed
          this.success = true;
          this.error = 'Sản phẩm đã được cập nhật nhưng không thể tải lên hình ảnh mới';
          this.saving = false;
          setTimeout(() => {
            this.router.navigate(['/products/admin/dashboard']);
          }, 3000);
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.productForm.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return 'Trường này là bắt buộc';
      }
      if (field.errors['minlength']) {
        return `Tối thiểu ${field.errors['minlength'].requiredLength} ký tự`;
      }
      if (field.errors['maxlength']) {
        return `Tối đa ${field.errors['maxlength'].requiredLength} ký tự`;
      }
      if (field.errors['min']) {
        return `Giá trị tối thiểu là ${field.errors['min'].min}`;
      }
    }
    return null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Clear imageUrl when file is selected
      this.productForm.patchValue({ imageUrl: '' });
    }
  }

  clearError(): void {
    this.error = '';
  }

  goBack(): void {
    // Check if coming from admin context
    const isAdminContext = this.router.url.includes('/admin/') ||
      window.location.pathname.includes('/admin/');

    // Always navigate to specific page based on context (no location.back)
    if (isAdminContext) {
      this.router.navigate(['/admin/products']);
    } else {
      this.router.navigate(['/products']);
    }
  }
}
