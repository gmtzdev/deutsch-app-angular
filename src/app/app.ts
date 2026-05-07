import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ThemeToggle } from './components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private environmentInjector = inject(EnvironmentInjector);
  private themeService = this.environmentInjector.get(ThemeService);

  ngOnInit(): void {
    this.themeService.initTheme();
  }
}
