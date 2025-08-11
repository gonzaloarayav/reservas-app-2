import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.userService.getCurrentUser();
    console.log('AdminGuard - Current user:', user);
    console.log('AdminGuard - Is admin:', user?.role === 'admin');
    
    if (user && user.role === 'admin') {
      return true;
    } else {
      console.log('AdminGuard - Access denied, redirecting to home');
      this.router.navigate(['/']);
      return false;
    }
  }
}