import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  orders: any[] = [];
  bookings: any[] = [];
  payments: any[] = [];
  currentView: 'orders' | 'bookings' | 'payments' | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  viewOrders(): void {
    this.currentView = 'orders';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get('http://localhost:3001/api/admin/orders', { headers })
      .subscribe({
        next: (response: any) => {
          this.orders = response;
        },
        error: (err) => alert('Error fetching orders: ' + err.error.message)
      });
  }

  viewTableBookings(): void {
    this.currentView = 'bookings';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get('http://localhost:3001/api/admin/bookings', { headers })
      .subscribe({
        next: (response: any) => {
          this.bookings = response;
        },
        error: (err) => alert('Error fetching bookings: ' + err.error.message)
      });
  }

  viewPayments(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get<any[]>('http://localhost:3001/api/admin/payments', { headers })
      .subscribe({
        next: (payments) => {
          this.payments = payments;
          this.currentView = 'payments';
        },
        error: (err) => console.error('Error fetching payments:', err)
      });
  }

  addNewFoodItem(): void {
    this.router.navigate(['/add-food-item']);
  }
  updateMenu(): void {
    console.log('Navigating to update menu...');
    this.router.navigate(['/update-menu']);
  }

  deleteMenu(): void {
    this.router.navigate(['/update-menu']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}