import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Table {
  _id: string;
  number: string;
  capacity: number;
  image: string;
}

@Component({
  selector: 'app-booktable',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './booktable.component.html',
  styleUrls: ['./booktable.component.css']
})
export class BookTableComponent implements OnInit {
  tables: Table[] = [
    { _id: '1', number: '1', capacity: 4, image: '/table1.jpg' },
    { _id: '2', number: '2', capacity: 6, image: '/table2.jpg' },
    { _id: '3', number: '3', capacity: 2, image: '/table3.jpg' },
    { _id: '4', number: '4', capacity: 8, image: '/table4.jpg' }
  ];
  userId: string = '';
  username: string = '';
  date: string = '';
  time: string = '';
  guests: number = 1;
  selectedTable: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    this.username = localStorage.getItem('username') || 'Guest';
    if (!this.userId) {
      this.router.navigate(['/login']);
    }
  }

  bookTable(): void {
    if (!this.date || !this.time || !this.guests || !this.selectedTable) {
      alert('Please fill in all fields.');
      return;
    }
    const bookingData = {
      userId: this.userId,
      username: this.username,
      date: new Date(this.date),
      time: this.time,
      guests: this.guests,
      tableNumber: this.selectedTable,
      status: 'Confirmed'
    };
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.post('http://localhost:3001/api/booking', bookingData, { headers }).subscribe({
      next: () => {
        alert('Table booked successfully!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error booking table:', err);
        alert('Failed to book table. Please try again.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/viewmenu']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}