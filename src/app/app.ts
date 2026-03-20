import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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
