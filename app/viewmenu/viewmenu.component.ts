import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

interface MenuItem {
  _id: string;
  name: string;
  image: string;
  price: string;
  rating: number;
  quantity: number;
  selectedQuantity: number;
  category: string;
  description: string;
}

interface MenuSection {
  name: string;
  description: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-viewmenu',
  templateUrl: './viewmenu.component.html',
  styleUrls: ['./viewmenu.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ViewMenuComponent implements OnInit {
  username: string = 'Guest';
  searchQuery: string = '';
  filteredMenuItems: MenuSection[] = [];
  userId: string = '';
  cartCount: number = 0;

  private descriptions: { [key: string]: string } = {
    'Chettinad Variety': 'Explore the rich and spicy flavors of Chettinad cuisine.',
    'Fried Rice Variety': 'A selection of delicious fried rice options to satisfy your cravings.',
    'Biryani Variety': 'Experience aromatic and flavorful biryanis from different regions.',
    'South Indian Delights': 'Traditional South Indian dishes like dosas and idlis.',
    'North Indian Specialties': 'Enjoy the rich flavors of North Indian curries and breads.',
    'Seafood Selections': 'Fresh and flavorful seafood dishes to tempt your taste buds.',
    'Vegetarian Feast': 'A special menu dedicated to delightful vegetarian dishes.',
    'Street Food Classics': 'Relish popular street food items served with a gourmet twist.',
    'Dessert Indulgence': 'Satisfy your sweet tooth with our range of desserts.',
    'Beverage Bar': 'A delightful assortment of refreshing beverages and cocktails.'
  };

  constructor(private router: Router, private http: HttpClient) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadMenuItems();
      });
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Guest';
    this.userId = localStorage.getItem('userId') || '';
    this.loadMenuItems();
    this.loadCartCount();
  }

  loadMenuItems(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get<MenuItem[]>('http://localhost:3001/api/menu', { headers }).subscribe({
      next: (items) => {
        console.log('Fetched menu items:', items);
        if (items && items.length > 0) {
          const groupedItems: { [key: string]: MenuItem[] } = {};
          items.forEach(item => {
            item.selectedQuantity = 0;
            if (!groupedItems[item.category]) {
              groupedItems[item.category] = [];
            }
            groupedItems[item.category].push(item);
          });

          this.filteredMenuItems = Object.keys(groupedItems).map(category => ({
            name: category,
            description: this.descriptions[category] || 'No description available.',
            items: groupedItems[category]
          }));

          console.log('Grouped menu items:', this.filteredMenuItems);
        } else {
          console.warn('No menu items found in the database.');
          this.filteredMenuItems = [];
        }
      },
      error: (err) => {
        console.error('Error loading menu items:', err);
        alert('Failed to load menu items. Please try again.');
        this.filteredMenuItems = [];
      }
    });
  }

  loadCartCount(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get<any[]>(`http://localhost:3001/api/cart/${this.userId}`, { headers }).subscribe({
      next: (cartItems) => {
        this.cartCount = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;
      },
      error: (err) => {
        console.error('Error loading cart count:', err);
        this.cartCount = 0;
      }
    });
  }

  incrementQuantity(item: MenuItem): void {
    if (item.selectedQuantity < item.quantity) {
      item.selectedQuantity++;
    } else {
      alert('Stock unavailable');
    }
  }

  decrementQuantity(item: MenuItem): void {
    if (item.selectedQuantity > 0) {
      item.selectedQuantity--;
    }
  }

  addToCart(item: MenuItem): void {
    if (item.selectedQuantity === 0) {
      alert('Please select at least one item to add to the cart.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    const cartItem = { itemId: item._id, quantity: item.selectedQuantity };

    this.http.post(`http://localhost:3001/api/cart/${this.userId}`, cartItem, { headers }).subscribe({
      next: () => {
        alert(`${item.name} added to cart successfully.`);
        this.loadCartCount();
        item.selectedQuantity = 0;
      },
      error: (err) => {
        console.error('Error adding item to cart:', err);
        alert(`Failed to add item to cart: ${err.error.message || 'Please try again.'}`);
      }
    });
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  navigateToBookTable(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/booktable']);
    }
  }

  goToHistory(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/order-history']);
    }
  }

  logout(): void {
    localStorage.clear();
    this.cartCount = 0;
    this.router.navigate(['/login']);
  }
}