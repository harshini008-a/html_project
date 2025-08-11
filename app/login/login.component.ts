import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  role: string = 'user';
  error: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password';
      return;
    }
    const loginData = { email: this.email, password: this.password, role: this.role };
    this.http.post('http://localhost:3001/api/auth/login', loginData).subscribe({
      next: (response: any) => {
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('username', response.username);
          localStorage.setItem('role', response.role);
          if (response.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/viewmenu']);
          }
        } else {
          this.error = response.message || 'Login failed';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred. Please try again.';
      }
    });
  }
}