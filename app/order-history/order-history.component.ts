import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  userId: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    if (this.userId) {
      this.loadOrders();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadOrders(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get<any[]>(`http://localhost:3001/api/orders/${this.userId}`, { headers }).subscribe({
      next: (response) => {
        this.orders = response;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        alert('Failed to load order history. Please try again.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/viewmenu']);
  }
}