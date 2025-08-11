import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  public isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {
    // Verificar si hay una preferencia guardada en localStorage
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme) {
      const isDark = JSON.parse(savedTheme);
      this.setDarkTheme(isDark);
    } else {
      // Verificar la preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkTheme(prefersDark);
    }
  }

  toggleTheme(): void {
    const currentTheme = this.isDarkTheme.value;
    this.setDarkTheme(!currentTheme);
  }

  setDarkTheme(isDark: boolean): void {
    this.isDarkTheme.next(isDark);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('darkTheme', JSON.stringify(isDark));
    
    // Aplicar la clase al body
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.style.colorScheme = 'dark';
    } else {
      document.body.classList.remove('dark-theme');
      document.body.style.colorScheme = 'light';
    }
  }

  getCurrentTheme(): boolean {
    return this.isDarkTheme.value;
  }
}