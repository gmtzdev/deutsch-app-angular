import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly dark = signal(false);
  readonly icon = computed(() => this.dark() ? 'pi-moon' : 'pi-sun');

  initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.dark.set(savedTheme === 'dark');
      if (savedTheme === 'dark') {
        document.querySelector('html')!.classList.add('dark');
      }
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.dark.set(prefersDark);
      if (prefersDark) {
        document.querySelector('html')!.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    }
  }

  toogleTheme(): void {
    document.querySelector('html')!.classList.toggle('dark');
    this.dark.update(v => !v);
    localStorage.setItem('theme', this.dark() ? 'dark' : 'light');
  }
}
