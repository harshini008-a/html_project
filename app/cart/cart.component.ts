import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: { item: MenuItem, quantity: number }[] = [];
  userId: string = '';
  private apiUrl = 'http://localhost:3001';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCart();
  }

  loadCart(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get<{ item: MenuItem, quantity: number }[]>(`${this.apiUrl}/api/cart/${this.userId}?populate=true`, { headers })
      .subscribe({
        next: (cart) => {
          this.cart = cart;
        },
        error: (err) => {
          console.error('Error loading cart:', err);
          if (err.status === 401) {
            alert('Your session has expired. Please log in again.');
            localStorage.clear();
            this.router.navigate(['/login']);
          } else {
            alert(`Failed to load cart: ${err.status} - ${err.error?.message || 'Unknown error'}`);
          }
        }
      });
  }

  getDescription(itemName: string): string {
    const item = this.cart.find(cartItem => cartItem.item.name === itemName);
    return item?.item.description || 'A delicious dish prepared with fresh ingredients.';
  }

  incrementQuantity(cartItem: { item: MenuItem, quantity: number }): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    const encodedItemName = encodeURIComponent(cartItem.item.name);
    const url = `${this.apiUrl}/api/cart/${this.userId}/${encodedItemName}`;
    console.log('Incrementing quantity, calling:', url);
    this.http.put(url, { quantity: cartItem.quantity + 1 }, { headers })
      .subscribe({
        next: () => {
          this.loadCart();
        },
        error: (err) => {
          console.error('Error incrementing quantity:', err);
          if (err.status === 401) {
            alert('Your session has expired. Please log in again.');
            localStorage.clear();
            this.router.navigate(['/login']);
          } else {
            alert(`Failed to increment quantity: ${err.status} - ${err.error?.message || 'Unknown error'}`);
          }
        }
      });
  }

  decrementQuantity(cartItem: { item: MenuItem, quantity: number }): void {
    const newQuantity = cartItem.quantity - 1;
    if (newQuantity < 0) return;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    const encodedItemName = encodeURIComponent(cartItem.item.name);
    const url = `${this.apiUrl}/api/cart/${this.userId}/${encodedItemName}`;
    console.log('Decrementing quantity, calling:', url);
    this.http.put(url, { quantity: newQuantity }, { headers })
      .subscribe({
        next: () => {
          this.loadCart();
        },
        error: (err) => {
          console.error('Error decrementing quantity:', err);
          if (err.status === 401) {
            alert('Your session has expired. Please log in again.');
            localStorage.clear();
            this.router.navigate(['/login']);
          } else {
            alert(`Failed to decrement quantity: ${err.status} - ${err.error?.message || 'Unknown error'}`);
          }
        }
      });
  }

  getTotalPrice(): string {
    if (!this.cart || this.cart.length === 0) {
      return '$0.00';
    }
    const total = this.cart.reduce((sum, cartItem) => {
      const price = parseFloat(cartItem.item.price.replace('$', '')) || 0;
      return sum + (price * cartItem.quantity);
    }, 0);
    return `$${total.toFixed(2)}`;
  }

  placeOrder(): void {
    const total = parseFloat(this.getTotalPrice().replace('$', ''));
    if (total === 0) {
      alert('Your cart is empty. Please add items to your cart before placing an order.');
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${localStorage.getItem('token')}`)
      .set('x-username', localStorage.getItem('username') || 'Unknown');
    const orderData = {
      userId: this.userId,
      username: localStorage.getItem('username') || 'Guest',
      items: this.cart.map(cartItem => ({
        name: cartItem.item.name,
        quantity: cartItem.quantity,
        price: cartItem.item.price
      })),
      total
    };

    this.http.post(`${this.apiUrl}/api/orders`, orderData, { headers })
      .subscribe({
        next: () => {
          alert('Order placed successfully!');
          this.router.navigate(['/payment'], { queryParams: { amount: total } });
        },
        error: (err) => {
          console.error('Error placing order:', err);
          if (err.status === 401) {
            alert('Your session has expired. Please log in again.');
            localStorage.clear();
            this.router.navigate(['/login']);
          } else {
            alert(`Failed to place the order: ${err.status} - ${err.error?.message || 'Unknown error'}`);
          }
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/viewmenu']);
  }
}