import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  role: string = 'user';
  error: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (!this.username || !this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }
    const signupData = { username: this.username, email: this.email, password: this.password, role: this.role };
    this.http.post('http://localhost:3001/api/auth/signup', signupData).subscribe({
      next: (response: any) => {
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('username', this.username);
          localStorage.setItem('role', this.role);
          if (this.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/viewmenu']);
          }
        } else {
          this.error = response.message || 'Sign up failed';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred. Please try again.';
      }
    });
  }
}