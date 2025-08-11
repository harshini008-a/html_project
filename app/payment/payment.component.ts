import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MenuItem {
  _id: string;
  name: string;
  image: string;
  price: string;
  rating: number;
  quantity: number;
  category: string;
  description: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  totalAmount: number = 0;
  userId: string = '';
  cartItems: { item: MenuItem, quantity: number }[] = [];
  payment = {
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  };
  billing = {
    fullName: '',
    email: '',
    phone: '',
    address: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || '';
    this.billing.fullName = localStorage.getItem('username') || 'Guest';
    this.billing.email = localStorage.getItem('email') || 'user@example.com';
    this.billing.phone = localStorage.getItem('phone') || '';
    this.billing.address = localStorage.getItem('address') || '';

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const amount = parseFloat(params.get('amount') || '0');
    this.totalAmount = isNaN(amount) ? 0 : amount;

    if (this.totalAmount <= 0) {
      alert('Invalid amount. Please try again.');
      this.router.navigate(['/cart']);
      return;
    }

    // Fetch cart items
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get<{ item: MenuItem, quantity: number }[]>(`http://localhost:3001/api/cart/${this.userId}`, { headers })
      .subscribe({
        next: (cart) => {
          this.cartItems = cart;
          if (!this.cartItems || this.cartItems.length === 0) {
            alert('Your cart is empty. Please add items to proceed with payment.');
            this.router.navigate(['/cart']);
          }
        },
        error: (err) => {
          console.error('Error fetching cart:', err);
          alert('Failed to load cart items. Please try again.');
          this.router.navigate(['/cart']);
        }
      });
  }

  processPayment() {
    if (!this.cartItems || this.cartItems.length === 0) {
      alert('No items in cart. Please add items to proceed.');
      return;
    }

    const progressBar = document.getElementById('progressBar') as HTMLElement;
    const progressText = document.getElementById('progressText') as HTMLElement;
    const progressContainer = document.getElementById('progressContainer') as HTMLElement;

    progressContainer.style.display = 'block';
    progressText.innerHTML = 'Processing... 0%';
    let width = 0;

    const interval = setInterval(() => {
      width += 2;
      progressBar.style.width = width + '%';
      progressText.innerHTML = `Processing... ${width}%`;

      if (width >= 100) {
        clearInterval(interval);

        const totalQuantity = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const paymentDetails = {
          userId: this.userId,
          billing: this.billing,
          payment: this.payment,
          amount: this.totalAmount,
          quantity: totalQuantity,
          items: this.cartItems.map(cartItem => ({
            name: cartItem.item.name,
            quantity: cartItem.quantity,
            price: cartItem.item.price
          }))
        };

        const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
        this.http.post('http://localhost:3001/api/payment', paymentDetails, { headers }).subscribe({
          next: (response: any) => {
            progressText.innerHTML = 'Payment Successful! Redirecting...';
            localStorage.setItem('paymentId', response.paymentId);
            localStorage.setItem('receiptId', response.receiptId);
            setTimeout(() => {
              this.router.navigate(['/pay-success']);
            }, 2000);
          },
          error: (error) => {
            console.error('Payment error:', error);
            progressText.innerHTML = 'Payment Failed';
            alert(`Payment failed: ${error.error?.message || 'Please check your payment details and try again.'}`);
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
          }
        });
      }
    }, 100);
  }
}