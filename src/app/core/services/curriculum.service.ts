import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Level, LevelWithTopics } from '../models/level.model';
import { Topic, TopicWithSubtopics } from '../models/topic.model';
import { Subtopic, SubtopicWithLessons } from '../models/subtopic.models';
import { Lesson } from '../models/lesson.model';
import { ElementTypeObj } from '../types';
import { CreateTopicDto } from '../dto/topic/create-topic.dto';
import { CreateSubtopicDto } from '../dto/subtopic/create-subtopic.dto';
import { CreateElementDto } from '../dto/elements/dto/create-element.dto';

const API_BASE = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class CurriculumService {
    private readonly http = inject(HttpClient);

    // ── Levels ─────────────────────────────────────────────────

    /** Obtiene todos los niveles disponibles (A1, A2, B1…). */
    getLevels(): Observable<Level[]> {
        return this.http.get<Level[]>(`${API_BASE}/levels`);
    }

    /** Obtiene un nivel con todos sus temas, subtemas y lecciones. */
    getLevelWithTopics(levelId: number | string): Observable<LevelWithTopics> {
        return this.http.get<LevelWithTopics>(`${API_BASE}/levels/${levelId}`);
    }

    /** Obtiene un tema con sus subtemas y lecciones. */
    getTopicWithSubtopics(topicId: number | string): Observable<TopicWithSubtopics> {
        return this.http.get<TopicWithSubtopics>(`${API_BASE}/topics/${topicId}`);
    }

    /** Obtiene un subtema con sus lecciones. */
    getSubtopicWithLessons(subtopicId: number | string): Observable<SubtopicWithLessons> {
        return this.http.get<SubtopicWithLessons>(`${API_BASE}/subtopics/${subtopicId}`);
    }

    /** Obtiene una lección por su ID. */
    getLesson(lessonId: number | string): Observable<Lesson> {
        return this.http.get<Lesson>(`${API_BASE}/lessons/${lessonId}`);
    }

    // ── Create ─────────────────────────────────────────────────

    /** Crea un nuevo tema en un nivel. */
    createTopic(levelId: number | string, title: string, subtitle?: string): Observable<Topic> {
        const payload: CreateTopicDto = {
            title,
            subtitle: subtitle || '',
            level: { id: Number(levelId) } as Level,
        };
        return this.http.post<Topic>(`${API_BASE}/topics`, payload);
    }

    /** Crea un nuevo subtema en un tema. */
    createSubtopic(topicId: number | string, title: string, icon?: string): Observable<Subtopic> {
        const payload: CreateSubtopicDto = {
            title,
            icon: icon || '',
            path: '',
            topic: { id: Number(topicId) } as Topic,
        };
        return this.http.post<Subtopic>(`${API_BASE}/subtopics`, payload);
    }

    /** Crea un elemento de texto (title, subtitle, paragraph) en una lección. */
    createElement(lessonId: number | string, type: 'title' | 'subtitle' | 'element', text: string): Observable<ElementTypeObj> {
        const payload: CreateElementDto = {
            text,
            type,
            lesson: { id: Number(lessonId) } as Lesson,
        };
        return this.http.post<ElementTypeObj>(`${API_BASE}/elements`, payload);
    }

    /** Crea una lista no ordenada con sus ítems en una lección. */
    createUnorderedList(lessonId: number | string, items: string[]): Observable<ElementTypeObj> {
        const payload = {
            type: 'unorderedList',
            lesson: { id: Number(lessonId) } as Lesson,
            list: items.map((text) => ({ text, type: 'listItem' })),
        };
        return this.http.post<ElementTypeObj>(`${API_BASE}/elements`, payload);
    }

    /** Crea una tabla con encabezados y filas en una lección. */
    createTable(lessonId: number | string, headers: string[], rows: { cells: string[] }[]): Observable<ElementTypeObj> {
        const payload = {
            type: 'table',
            lesson: { id: Number(lessonId) } as Lesson,
            headers,
            rows,
        };
        return this.http.post<ElementTypeObj>(`${API_BASE}/elements`, payload);
    }

    /** Crea un bloque de consejo (tip) en una lección. */
    createTip(lessonId: number | string, tipTitle: string, text: string, style: string): Observable<ElementTypeObj> {
        const payload = {
            type: 'tip',
            lesson: { id: Number(lessonId) } as Lesson,
            text,
            style,
            tipTitle,
        };
        return this.http.post<ElementTypeObj>(`${API_BASE}/elements`, payload);
    }
}
