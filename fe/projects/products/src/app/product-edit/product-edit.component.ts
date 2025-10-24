import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-product-edit',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="product-edit-container">
      <h2>Edit Product</h2>
      <p>Product editing functionality is not yet implemented.</p>
      <button (click)="goBack()">Back to Product List</button>
    </div>
  `,
    styles: [`
    .product-edit-container {
      padding: 2rem;
    }
  `]
})
export class ProductEditComponent implements OnInit {

    constructor(private router: Router, private route: ActivatedRoute) { }

    ngOnInit(): void {
        const productId = this.route.snapshot.paramMap.get('id');
        console.log('Editing product with ID:', productId);
    }

    goBack(): void {
        this.router.navigate(['/products']);
    }
}
