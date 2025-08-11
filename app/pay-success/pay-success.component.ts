import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pay-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pay-success.component.html',
  styleUrls: ['./pay-success.component.css']
})
export class PaySuccessComponent implements OnInit {
  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const paymentId = localStorage.getItem('paymentId');
    console.log('Payment ID:', paymentId); // Debugging log
    if (paymentId) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
      this.http.patch(`http://localhost:3001/api/admin/payments/${paymentId}`, { status: 'paid' }, { headers })
        .subscribe({
          next: () => {
            console.log('Payment status updated to Paid');
            localStorage.removeItem('paymentId');
          },
          error: (err) => console.error('Error updating payment status:', err.error.message)
        });
    }
  }
  goBackToHome(): void {
    this.router.navigate(['/home']);
  }

  receipt(): void {
    this.router.navigate(['/receipt']);
  }
}