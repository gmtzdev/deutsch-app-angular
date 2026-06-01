import { Component, computed, inject, input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-user-avatar',
    templateUrl: './user-avatar.html',
    styleUrls: ['./user-avatar.scss'],
})
export class UserAvatarComponent {
    private readonly auth = inject(AuthService);
    public size = input<string>('sm'); // 'sm', 'md', 'lg'
    readonly currentUser = this.auth.currentUser;
    readonly userInitials = computed(() => {
        const user = this.currentUser();
        if (!user) return '?';
        return user.username.slice(0, 2).toUpperCase();
    });
}