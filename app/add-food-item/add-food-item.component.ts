import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface MenuItem {
  _id: string;
  name: string;
  image: string;
  price: string;
  rating: number;
  quantity: number;
  category: string;
}

interface MenuSection {
  name: string;
  description: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-add-food-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-food-item.component.html',
  styleUrls: ['./add-food-item.component.css']
})
export class AddFoodItemComponent implements OnInit {
  addForm: FormGroup;
  categories = [
    'Chettinad Variety', 'Fried Rice Variety', 'Biryani Variety', 'South Indian Delights',
    'North Indian Specialties', 'Seafood Selections', 'Vegetarian Feast', 'Street Food Classics',
    'Dessert Indulgence', 'Beverage Bar'
  ];
  filteredMenuItems: MenuSection[] = [];
  descriptions: { [key: string]: string } = {
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

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder) {
    this.addForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      rating: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      image: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get<MenuItem[]>('http://localhost:3001/api/menu', { headers }).subscribe({
      next: (items) => {
        const groupedItems: { [key: string]: MenuItem[] } = {};
        this.categories.forEach(category => {
          groupedItems[category] = items.filter(item => item.category === category);
        });

        this.filteredMenuItems = this.categories
          .filter(category => groupedItems[category].length > 0)
          .map(category => ({
            name: category,
            description: this.descriptions[category] || 'No description available.',
            items: groupedItems[category]
          }));
      },
      error: (err) => {
        console.error('Error loading menu items:', err);
        alert('Failed to load menu items.');
      }
    });
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.addForm.patchValue({ image: file });
      this.addForm.get('image')?.updateValueAndValidity();
    }
  }

  addItem(): void {
    if (this.addForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.addForm.get('name')?.value);
    formData.append('category', this.addForm.get('category')?.value);
    formData.append('price', `$${this.addForm.get('price')?.value}`);
    formData.append('rating', this.addForm.get('rating')?.value);
    formData.append('quantity', this.addForm.get('quantity')?.value);
    formData.append('image', this.addForm.get('image')?.value);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.post('http://localhost:3001/api/admin/menu', formData, { headers }).subscribe({
      next: () => {
        alert('Food item added successfully.');
        this.addForm.reset();
        this.loadMenuItems();
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error('Error adding food item:', err);
        alert('Error adding food item: ' + (err.error.message || 'Unknown error'));
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  getImageUrl(imagePath: string): string {
    return imagePath.startsWith('http') ? imagePath : `http://localhost:3001${imagePath}`;
  }
}