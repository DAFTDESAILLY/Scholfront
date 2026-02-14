import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    standalone: true,
    template: `
    <footer class="footer">
      <p>&copy; 2026 School Management System. v1.0</p>
    </footer>
  `,
    styles: [`
    .footer {
      padding: 10px;
      text-align: center;
      background-color: #f5f5f5;
      color: #666;
      font-size: 12px;
      margin-top: auto;
    }
  `]
})
export class FooterComponent { }
