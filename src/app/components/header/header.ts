import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserAvatarComponent } from '../user-avatar/user-avatar';

@Component({
  selector: 'app-header',
  imports: [UserAvatarComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '?';
    return user.username.slice(0, 2).toUpperCase();
  });

  readonly isMenuOpen = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.closeMenu();
    this.auth.logout();
  }

  goToAdmin(): void {
    this.closeMenu();
    this.router.navigate(['/admin']);
  }
}
