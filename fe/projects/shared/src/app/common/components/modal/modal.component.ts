import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
    @Input() isOpen = false;
    @Input() title = '';
    @Input() message = '';
    @Input() confirmText = 'Xác nhận';
    @Input() cancelText = 'Hủy';
    @Input() type: 'success' | 'warning' | 'danger' | 'info' = 'info';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    onConfirm(): void {
        this.confirm.emit();
        this.closeModal();
    }

    onCancel(): void {
        this.cancel.emit();
        this.closeModal();
    }

    onClose(): void {
        this.close.emit();
        this.closeModal();
    }

    closeModal(): void {
        this.isOpen = false;
    }

    onBackdropClick(event: Event): void {
        if (event.target === event.currentTarget) {
            this.onClose();
        }
    }
}