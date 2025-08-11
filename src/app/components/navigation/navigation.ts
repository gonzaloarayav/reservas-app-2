import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css'
})
export class Navigation implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  
  currentUser$: Observable<User | null>;
  currentUser: User | null = null;
  isDarkTheme$: Observable<boolean>;
  isDarkTheme: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor() {
    this.currentUser$ = this.userService.getCurrentUser$();
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  ngOnInit() {
    this.subscription.add(
      this.currentUser$.subscribe(user => {
        this.currentUser = user;
        console.log('Navigation - currentUser actualizado:', user);
      })
    );

    this.subscription.add(
      this.isDarkTheme$.subscribe(isDark => {
        this.isDarkTheme = isDark;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isLoggedIn() {
    const loggedIn = this.currentUser !== null;
    console.log('Navigation - isLoggedIn:', loggedIn);
    return loggedIn;
  }

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  logout() {
    this.userService.logout().subscribe(() => {
      // Redirigir a la página de inicio después de cerrar sesión
      this.router.navigate(['/']);
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
