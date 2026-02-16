import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';

@Component({
    selector: 'app-help-icon',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
    template: `
    <button mat-icon-button class="help-button" (click)="openHelp()" matTooltip="Ver ayuda del módulo">
      <mat-icon>help_outline</mat-icon>
    </button>
  `,
    styles: [`
    .help-button {
      color: #7986cb; /* Soft indigo color */
      transform: scale(0.9);
      transition: all 0.2s ease;
      margin-left: 8px;
    }
    .help-button:hover {
      color: #3f51b5; /* Primary indigo */
      transform: scale(1.1);
      background-color: rgba(63, 81, 181, 0.08); /* Light touch feedback */
    }
  `]
})
export class HelpIconComponent {
    @Input() message: string = '';

    constructor(private dialog: MatDialog) { }

    openHelp() {
        this.dialog.open(HelpDialogComponent, {
            data: { message: this.message },
            panelClass: 'custom-dialog-container',
            backdropClass: 'custom-dialog-backdrop'
        });
    }
}
