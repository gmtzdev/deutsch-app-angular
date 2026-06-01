import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    output,
} from '@angular/core';
import { UserAlert } from './UserAlert';

@Component({
    selector: 'app-user-alert',
    standalone: true,
    templateUrl: './user-alert.html',
    styleUrls: ['./user-alert.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [],
})
export class UserAlertComponent {
    readonly open = input.required<boolean>();
    readonly userAlert = input.required<UserAlert>();
    readonly actionLabel = input<string | null>(null);

    readonly close = output<void>();
    readonly action = output<void>();


    readonly role = computed(() => (this.userAlert().tone === 'success' ? 'status' : 'alert'));
    readonly liveRegion = computed(() => (this.userAlert().tone === 'success' ? 'polite' : 'assertive'));

    readonly icon = computed(() => {
        switch (this.userAlert().tone) {
            case 'success':
                return '✓';
            case 'warning':
                return '!';
            case 'error':
                return '⚠';
            default:
                return 'i';
        }
    });
}