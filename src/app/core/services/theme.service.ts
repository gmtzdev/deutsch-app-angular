import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly dark = signal(false);
  readonly icon = computed(() => this.dark() ? 'pi-moon' : 'pi-sun');

  initTheme(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.dark.set(prefersDark);
    if (prefersDark) {
      document.querySelector('html')!.classList.add('dark');
    }
  }

  toogleTheme(): void {
    document.querySelector('html')!.classList.toggle('dark');
    this.dark.update(v => !v);
  }
}
