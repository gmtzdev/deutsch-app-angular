import { Component, input } from '@angular/core';

@Component({
    selector: 'app-card-info-admin',
    template: `
        <div class="stat-card bg-card">
            <div class="stat-icon stat-icon--{{ color() }}" aria-hidden="true">
                <i class="pi {{ icon() }}"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value">
                    @if (info() === null || info() === undefined) { — }
                    @else { {{ info() }} }
                </span>
                <span class="stat-label">{{ label() }}</span>
            </div>
        </div>
    `,
    styleUrls: ['./card-info-admin.component.scss']
})
export class CardInfoAdminComponent {
    public color = input<'blue' | 'purple' | 'green'>('blue');
    public icon = input<string>('pi-desktop');
    public label = input<string>('Niveles')
    public info = input<string | null | undefined>(null);
}