import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      (click)="themeService.toogleTheme()"
      [attr.aria-label]="themeService.dark() ? 'Switch to light mode' : 'Switch to dark mode'"
      [attr.aria-pressed]="themeService.dark()"
      title="Toggle theme"
    >
      <i class="pi" [class]="themeService.icon()"></i>
    </button>
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 1000;
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background-color: var(--color-background, #6366f1);
      color: var(--color-title);
      box-shadow: var(--shadow-toggle, 0 4px 12px rgba(0, 0, 0, 0.25));
      transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;

      &:hover {
        background-color: var(--p-primary-hover-color, #4f46e5);
        box-shadow: var(--shadow-toggle, 0 6px 16px rgba(0, 0, 0, 0.35));
      }

      &:active {
        transform: scale(0.92);
      }

      &:focus-visible {
        outline: 3px solid var(--p-primary-color, #6366f1);
        outline-offset: 3px;
      }
    }

    .pi {
      font-size: 1.25rem;
    }
  `],
})
export class ThemeToggle {
  protected readonly themeService = inject(ThemeService);
}
