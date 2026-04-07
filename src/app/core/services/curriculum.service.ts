import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Level, LevelWithTopics } from '../models/level.model';
import { Topic, TopicWithSubtopics } from '../models/topic.model';
import { Subtopic, SubtopicWithLessons } from '../models/subtopic.models';
import { Lesson } from '../models/lesson.model';
import { ElementTypeObj, LessonElementDto } from '../types';
import { CreateTopicDto } from '../dto/topic/create-topic.dto';
import { CreateSubtopicDto } from '../dto/subtopic/create-subtopic.dto';
import { CreateElementDto } from '../dto/elements/dto/create-element.dto';
import { CreateBodyLessonDto } from '../dto/elements/dto/create-body-lesson.dto';
import { UnorderedList } from '../models/elements/unorderedlist.model';
import { CreateTitleDto } from '../dto/elements/dto/title/create-title.dto';
import { CreateSubtitleDto } from '../dto/elements/dto/subtitle/create-title.dto';
import { CreateUnorderedListDto } from '../dto/elements/dto/unorderedlist/create-title.dto';
import { CreateTableDto } from '../dto/elements/dto/table/create-table.dto';
import { Table } from '../models/elements/table.model';
import { CreateConjugationDto } from '../dto/elements/dto/conjugation/create-conjugation.dto';
import { Conjugation } from '../models/elements/conjugation.model';
import { CreateQuizDto } from '../dto/elements/dto/quiz/create-quiz.dto';
import { Quiz } from '../models/elements/quiz.model';

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
            id: 0,
            text,
            type,
            lesson: { id: Number(lessonId) } as Lesson,
            delete: false
        };
        return this.http.post<ElementTypeObj>(`${API_BASE}/elements`, payload);
    }



    /** Crea una lista no ordenada con sus ítems en una lección. */
    createLesson(lessonId: number | string, preview: ElementTypeObj[]): Observable<ElementTypeObj> {
        let elements: LessonElementDto[] = [];
        for (const el of preview) {
            switch (el.type) {
                case 'title':
                    elements.push({
                        id: el.id,
                        text: el.text,
                        style: '',
                        type: 'title',
                        lesson: { id: Number(lessonId) } as Lesson,
                        baseStyle: '',
                        delete: el.delete
                    } as CreateTitleDto)
                    break;
                case 'subtitle':
                    elements.push({
                        id: el.id,
                        text: el.text,
                        style: '',
                        type: 'subtitle',
                        lesson: { id: Number(lessonId) } as Lesson,
                        baseStyle: '',
                        delete: el.delete
                    } as CreateSubtitleDto)
                    break;
                case 'unorderedList':
                    const lis = (el as UnorderedList).list.map((li, i): CreateElementDto => ({
                        id: li.id,
                        text: li.text,
                        style: '',
                        type: 'listItem',
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: li.delete,
                    }));

                    elements.push({
                        id: el.id,
                        text: '',
                        style: '',
                        type: 'unorderedList',
                        lesson: { id: Number(lessonId) } as Lesson,
                        baseStyle: 'ul',
                        list: lis,
                        delete: el.delete
                    } as CreateUnorderedListDto)
                    break;
                case 'tag':
                    elements.push({
                        id: el.id,
                        text: el.text,
                        style: el.style,
                        type: 'tag',
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: el.delete
                    } as CreateElementDto)
                    break;
                case 'table':
                    const aux = el as Table;
                    elements.push({
                        id: aux.id,
                        text: aux.text,
                        style: aux.style,
                        type: 'table',
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: aux.delete,
                        baseStyle: aux.baseStyle,
                        headers: aux.headers,
                        rows: aux.rows
                    } as CreateTableDto)
                    break;
                case 'conjugation':
                    const auxc = el as Conjugation;
                    elements.push({
                        id: auxc.id,
                        text: auxc.text,
                        style: auxc.style,
                        type: auxc.type,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: auxc.delete,
                        verbs: auxc.verbs,
                    } as CreateConjugationDto)
                    break;
                case 'quiz':
                    const auxq = el as Quiz;
                    elements.push({
                        id: auxq.id,
                        text: auxq.text,
                        style: auxq.style,
                        type: auxq.type,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: auxq.delete,
                        questions: auxq.questions,
                    } as CreateQuizDto)
                    break;
                default:
                    console.warn(`Element type ${el.type} is not supported for creation yet.`);
                    break;
            }
        }

        const payload: CreateBodyLessonDto = {
            lesson: { id: Number(lessonId) } as Lesson,
            elements: elements
        };
        console.log(payload);
        return this.http.post<ElementTypeObj>(`${API_BASE}/elements/create-lesson`, payload);
    }

}
