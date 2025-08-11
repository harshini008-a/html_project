import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-menu',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-menu.component.html',
  styleUrls: ['./update-menu.component.css']
})
export class UpdateMenuComponent implements OnInit {
  menus: any[] = [];
  updateForm: FormGroup;
  selectedItem: any = null;
  categories = [
    'Chettinad Variety', 'Fried Rice Variety', 'Biryani Variety', 'South Indian Delights',
    'North Indian Specialties', 'Seafood Selections', 'Vegetarian Feast', 'Street Food Classics',
    'Dessert Indulgence', 'Beverage Bar'
  ];

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', Validators.required],
      rating: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get('http://localhost:3001/api/admin/menu', { headers })
      .subscribe({
        next: (response: any) => {
          this.menus = response;
        },
        error: (err) => {
          console.error('Error fetching menu:', err);
          alert('Error fetching menu: ' + err.error.message);
        }
      });
  }

  selectItem(item: any): void {
    this.selectedItem = item;
    this.updateForm.patchValue({
      name: item.name,
      category: item.category,
      price: item.price,
      rating: item.rating,
      quantity: item.quantity,
      description: item.description
    });
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.updateForm.patchValue({ image: file });
    }
  }

  updateItem(): void {
    if (this.updateForm.invalid || !this.selectedItem) {
      alert('Please fill all required fields.');
      return;
    }
    const formData = new FormData();
    formData.append('name', this.updateForm.get('name')?.value);
    formData.append('category', this.updateForm.get('category')?.value);
    formData.append('price', this.updateForm.get('price')?.value);
    formData.append('rating', this.updateForm.get('rating')?.value);
    formData.append('quantity', this.updateForm.get('quantity')?.value);
    formData.append('description', this.updateForm.get('description')?.value);
    if (this.updateForm.get('image')?.value) {
      formData.append('image', this.updateForm.get('image')?.value);
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.put(`http://localhost:3001/api/admin/menu/${this.selectedItem._id}`, formData, { headers })
      .subscribe({
        next: () => {
          alert('Menu item updated successfully.');
          this.loadMenus();
          this.updateForm.reset();
          this.selectedItem = null;
        },
        error: (err) => {
          console.error('Error updating menu item:', err);
          alert('Error updating menu item: ' + err.error.message);
        }
      });
  }

  deleteItem(id: string): void {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.delete(`http://localhost:3001/api/admin/menu/${id}`, { headers })
      .subscribe({
        next: () => {
          alert('Menu item deleted successfully.');
          this.loadMenus();
        },
        error: (err) => {
          console.error('Error deleting menu item:', err);
          alert('Error deleting menu item: ' + err.error.message);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}