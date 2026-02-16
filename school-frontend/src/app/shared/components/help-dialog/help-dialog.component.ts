import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-help-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="help-dialog-container">
      <div class="header">
        <mat-icon class="info-icon">info</mat-icon>
        <span class="title">Información del Módulo</span>
      </div>
      <div class="content">
        <p>{{ data.message }}</p>
      </div>
      <div class="actions">
        <button mat-button (click)="close()">Entendido</button>
      </div>
    </div>
  `,
    styles: [`
    .help-dialog-container {
      padding: 24px;
      min-width: 300px;
      max-width: 400px;
      background: white;
      border-radius: 8px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      color: #3f51b5;
    }
    .info-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .title {
      font-size: 18px;
      font-weight: 500;
    }
    .content {
      color: #555;
      line-height: 1.5;
      font-size: 15px;
      margin-bottom: 24px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class HelpDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { message: string },
        private dialogRef: MatDialogRef<HelpDialogComponent>
    ) { }

    close(): void {
        this.dialogRef.close();
    }
}
