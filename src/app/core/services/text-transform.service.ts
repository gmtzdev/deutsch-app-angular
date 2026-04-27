import { computed, inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class TextTransformService {

    private readonly sanitizer = inject(DomSanitizer)

    constructor() { }

    public toSafeHtml(text: string): SafeHtml {
        // Escapar HTML para prevenir inyección
        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        // Aplicar negritas tipo markdown **texto**
        const html = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }


}
