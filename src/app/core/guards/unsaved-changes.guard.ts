import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
    canDeactivate(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
    if (component.canDeactivate()) return true;
    return confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?');
};
