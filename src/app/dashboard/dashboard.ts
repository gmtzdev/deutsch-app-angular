import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
    selector: 'app-dashboard',
    imports: [Button, Card],
    template: `
    <div class="dashboard-shell">
      <p-card styleClass="dashboard-card">
        <div class="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Bienvenido, <strong>{{ currentUser()?.username }}</strong>
              &mdash; rol: {{ currentUser()?.role }}
            </p>
          </div>
          <p-button
            label="Cerrar sesión"
            severity="secondary"
            icon="pi pi-sign-out"
            (onClick)="logout()"
            aria-label="Cerrar sesión"
          />
        </div>
        <p class="placeholder">
          Contenido protegido de la aplicación. Sólo usuarios autenticados
          pueden ver esta página.
        </p>
      </p-card>
    </div>
  `,
    styles: [
        `
      .dashboard-shell {
        min-height: 100vh;
        background: var(--p-surface-ground);
        padding: 2rem 1rem;
      }

      :host ::ng-deep .dashboard-card {
        max-width: 900px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;

        h1 {
          margin: 0 0 0.25rem;
        }

        p {
          margin: 0;
          color: var(--p-text-muted-color);
          font-size: 0.9rem;
        }
      }

      .placeholder {
        color: var(--p-text-muted-color);
        font-style: italic;
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
    private readonly authService = inject(AuthService);
    protected readonly currentUser = this.authService.currentUser;

    logout(): void {
        this.authService.logout();
    }
}
