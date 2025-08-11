import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  currentTheme: string = 'light-theme'; // Default theme
  slideIndex: number = 0;
  private slideshowInterval: any;

  // Slideshow data
  slides = [
    { image: '/slide1.jpg', alt: 'Dish 1' },
    { image: '/slide2.jpg', alt: 'Dish 2' },
    { image: '/slide3.jpg', alt: 'Dish 3' }
  ];

  // Food quotes data
  foodQuotes = [
    "Good food is the foundation of genuine happiness.",
    "Life is a combination of magic and pasta.",
    "Food is our common ground, a universal experience."
  ];

  // Special Menu Items Data
  specialMenuItems = [
    {
      name: 'Chettinad Briyani',
      description: 'Freshly grilled salmon with herbs and lemon zest.',
      price: '$25.99',
      image: '/Chettinad Biryani.jpg'
    },
    {
      name: 'Chicken Fried Rice',
      description: 'Creamy pasta with grilled chicken and parmesan cheese.',
      price: '$18.99',
      image: '/Egg Fried Rice.jpg'
    },
    {
      name: 'Fish Tikka',
      description: 'Thin crust pizza loaded with fresh vegetables and mozzarella.',
      price: '$15.99',
      image: '/Fish Tikka.jpg'
    },
    {
      name: 'Pav Bhaji',
      description: 'Juicy beef steak cooked to perfection with garlic butter.',
      price: '$29.99',
      image: '/Pav Bhaji.jpg'
    },
    {
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with a gooey center, served with ice cream.',
      price: '$9.99',
      image: '/Chocolate Lava Cake.jpg'
    }
  ];

  private apiUrl = 'http://localhost:3001/api'; // Consistent with other components

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.startSlideshow();
    // Load special menu items (e.g., first 5 items from a specific section)
    this.http.get<any[]>(`${this.apiUrl}/menu`).subscribe({
      next: (data) => {
        this.specialMenuItems = data[0]?.items.slice(0, 5) || [];
      },
      error: () => console.error('Error fetching special menu')
    });
  }

  ngOnDestroy(): void {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private startSlideshow(): void {
    this.slideshowInterval = setInterval(() => {
      this.slideIndex = (this.slideIndex + 1) % this.slides.length;
    }, 5000);
  }
}