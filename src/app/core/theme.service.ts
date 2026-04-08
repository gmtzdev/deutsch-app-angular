import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public icon = '';
  public dark: boolean = false;

  private toogleIcon() {
    this.icon = this.dark ? 'pi-moon' : 'pi-sun';
  }

  constructor() { }

  /**
   * This method detect if the client has his system
   * in dark mode and puts the web in dark mode
   */
  initTheme(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.dark = prefersDark;
    if (prefersDark) {
      const element = document.querySelector('html') as HTMLElement;
      element.classList.add('dark');
    }
    this.toogleIcon();
  }


  /**
   * This method toggle the theme 
   */
  toogleTheme(): void {
    const element = document.querySelector('html') as HTMLElement;
    element.classList.toggle('dark');
    this.dark = !this.dark;
    this.toogleIcon();
  }
}
