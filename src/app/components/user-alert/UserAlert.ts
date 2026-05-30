import { AlertTone } from "./AlertTone.enum";

export interface UserAlert {
    title: string;
    message: string;
    tone: AlertTone;
    eyebrow: string;
    actionLabel?: string;
}