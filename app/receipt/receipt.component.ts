import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';

interface Receipt {
  _id: string;
  userId: string;
  username: string;
  email: string;
  quantity: number;
  totalAmount: number;
  purchaseDate: string;
  items: { name: string; quantity: number; price: string }[];
}

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css']
})
export class ReceiptComponent implements OnInit {
  receipt: Receipt | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get<Receipt[]>(`http://localhost:3001/api/receipts/${userId}`, { headers }).subscribe({
      next: (receipts) => {
        console.log('Fetched receipts:', receipts);
        if (receipts && receipts.length > 0) {
          this.receipt = receipts.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())[0];
        } else {
          this.receipt = null;
          alert('No receipts found. Please complete a payment to generate a receipt.');
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Error fetching receipt:', err);
        alert('Failed to fetch receipt. Please try again.');
        this.router.navigate(['/home']);
      }
    });
  }

  formatPrice(price: string): string {
    return parseFloat(price.replace('$', '')).toFixed(2);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  downloadPDF(): void {
    if (!this.receipt) {
      console.warn('No receipt data available for PDF generation.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Cadelite Cafe', 20, 20);
    doc.setFontSize(14);
    doc.text('Restaurant Receipt', 20, 30);
    doc.line(20, 35, 190, 35); // Divider

    doc.setFontSize(12);
    doc.text(`Username: ${this.receipt.username || 'N/A'}`, 20, 50);
    doc.text(`Email: ${this.receipt.email || 'N/A'}`, 20, 60);
    doc.text(`Purchase Date: ${this.receipt.purchaseDate || 'N/A'}`, 20, 70);

    doc.text('Purchased Items:', 20, 90);
    let y = 100;
    if (this.receipt.items.length > 0) {
      this.receipt.items.forEach(item => {
        doc.text(`${item.name} (x${item.quantity}) - $${this.formatPrice(item.price)}`, 20, y);
        y += 10;
      });
    } else {
      doc.text('No items purchased.', 20, y);
      y += 10;
    }

    doc.text(`Total Amount: $${this.receipt.totalAmount.toFixed(2)}`, 20, y + 10);

    doc.save('receipt.pdf');
  }
}