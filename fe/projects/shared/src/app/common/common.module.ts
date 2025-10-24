import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        HttpClientModule,
    ],
    exports: [
        CommonModule,
        HttpClientModule,
    ],
})
export class SharedCommonModule {
    // Module for shared common utilities, HTTP client, etc.
}