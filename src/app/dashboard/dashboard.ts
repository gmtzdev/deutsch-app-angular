import { Component, inject, ChangeDetectionStrategy, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CurriculumService } from '../core/services/curriculum.service';
import { Level } from '../core/models/level.model';
import { Header } from '../components/header/header';

const LEVEL_ACCENTS: Record<string, string> = {
  A1: '#22c55e',
  A2: '#3b82f6',
  B1: '#f59e0b',
  B2: '#ef4444',
  C1: '#8b5cf6',
  C2: '#ec4899',
};

@Component({
  selector: 'app-dashboard',
  imports: [Header, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly curriculumService = inject(CurriculumService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly levelsResource = resource<Level[], undefined>({
    loader: () => firstValueFrom(this.curriculumService.getLevels()),
  });

  logout(): void {
    this.authService.logout();
  }
}
