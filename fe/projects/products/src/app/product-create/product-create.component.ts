import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ProductCreateRequest, ProductService } from '../../../../shared/src/app/product';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss'
})
export class ProductCreateComponent implements OnInit {
  productForm!: FormGroup;
  loading = false;
  success = false;
  error: string | null = null;

  categories: string[] = [];
  brands: string[] = [];

  // Image upload
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  imageUploadError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadFormData();
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(1000)]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      stockQuantity: [null, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.maxLength(100)]],
      brand: ['', [Validators.maxLength(50)]],
      imageUrl: ['', [Validators.maxLength(500)]]
    });
  }

  private loadFormData(): void {
    // Load categories
    this.productService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories:', err)
    });

    // Load brands
    this.productService.getBrands().subscribe({
      next: (brands) => this.brands = brands,
      error: (err) => console.error('Error loading brands:', err)
    });
  }

  onSubmit(): void {
    if (!this.productForm.valid || this.loading) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formData = this.productForm.value;
    const productData: ProductCreateRequest = {
      name: formData.name?.trim(),
      description: formData.description?.trim() || '',
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      // Skip category and brand for now until backend mapping is fixed
      // category: formData.category?.trim() || '',
      // brand: formData.brand?.trim() || '',
      imageUrl: formData.imageUrl?.trim() || undefined
    };

    console.log('Sending product data:', productData);

    this.productService.createProduct(productData).subscribe({
      next: (createdProduct) => {
        console.log('Product created:', createdProduct);

        // If there's a file to upload, upload it after product creation
        if (this.selectedFile && createdProduct.id) {
          this.uploadProductImage(createdProduct.id);
        } else {
          this.success = true;
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 1500);
        }
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.error = 'Không thể tạo sản phẩm. Vui lòng kiểm tra lại thông tin.';
        this.loading = false;
      }
    });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.productForm.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) return 'Trường này là bắt buộc';
      if (field.errors['maxlength']) return `Tối đa ${field.errors['maxlength'].requiredLength} ký tự`;
      if (field.errors['min']) return `Giá trị tối thiểu là ${field.errors['min'].min}`;
    }
    return null;
  }

  // Image upload methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageUploadError = null;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.imageUploadError = 'Vui lòng chọn file hình ảnh (JPG, PNG, GIF, etc.)';
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.imageUploadError = 'Kích thước file không được vượt quá 5MB';
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Clear image URL when file is selected
      this.productForm.patchValue({ imageUrl: '' });
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.imageUploadError = null;

    // Reset file input
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private uploadProductImage(productId: number): void {
    if (!this.selectedFile) {
      this.success = true;
      this.loading = false;
      setTimeout(() => {
        this.router.navigate(['/admin/dashboard']);
      }, 1500);
      return;
    }

    console.log('Uploading image for product:', productId);

    this.productService.uploadProductImage(productId, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Image uploaded successfully:', response);
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        // Product created but image upload failed
        this.error = 'Sản phẩm đã được tạo nhưng không thể upload hình ảnh. Bạn có thể thêm hình ảnh sau.';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 3000);
      }
    });
  }

  goBack() {
    // Check if coming from admin context via route or URL
    const isAdminContext = this.router.url.includes('/admin/') ||
      window.location.pathname.includes('/admin/');

    // Always navigate to specific page based on context (no location.back)
    if (isAdminContext) {
      this.router.navigate(['/admin/products']);
    } else {
      this.router.navigate(['/products']);
    }
  }

  clearError() {
    this.error = '';
  }
}