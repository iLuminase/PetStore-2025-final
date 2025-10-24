import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

// Services
import { ProductService } from './services/product.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        HttpClientModule,
        ReactiveFormsModule
    ],
    providers: [
        ProductService
    ],
    exports: [
        CommonModule,
        HttpClientModule,
        ReactiveFormsModule
    ]
})
export class ProductModule { }