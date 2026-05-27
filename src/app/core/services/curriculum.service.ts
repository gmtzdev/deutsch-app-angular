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
import { CreateDragDropDto } from '../dto/elements/dto/drag-drop/create-drag-drop.dto';
import { DragDropExercise } from '../models/elements/drag-drop-exercise.model';
import { environment } from '../../../environments/environment';
import { CreatePronunciationBlockDto } from '../dto/elements/dto/pronunciation/create-pronunciation-block.dto';
import { PronunciationBlock } from '../models/elements/pronunciation-block.model';
import { Tip } from '../models/elements/tip.model';
import { UpdateSubtopicDto } from '../dto/subtopic/update-subtopic.dto';
import { UpdateTopicDto } from '../dto/topic/update-topic.dto';
import { FillBlankExercise } from '../models/elements/fill-blank-exercise.model';
import { CreateFillBlankDto } from '../dto/elements/dto/fill-blank/create-fill-blank.dto';
import { ReorderSubtopicDto } from '../dto/subtopic/reorder-subtopic.dto';

const API_BASE = environment.apiUrl;

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

    /** Actualiza el título y subtítulo de un tema. */
    updateTopic(topicId: number | string, topic: UpdateTopicDto): Observable<Topic> {
        return this.http.patch<Topic>(`${API_BASE}/topics/${topicId}`, topic);
    }

    /** Elimina un tema por su ID. */
    deleteTopic(topicId: number | string): Observable<void> {
        return this.http.delete<void>(`${API_BASE}/topics/${topicId}`);
    }

    /** Actualiza el título de un subtema. */
    updateSubtopic(subtopicId: number | string, subtopic: UpdateSubtopicDto): Observable<Subtopic> {
        return this.http.patch<Subtopic>(`${API_BASE}/subtopics/${subtopicId}`, subtopic);
    }

    /** Reordena los subtemas de un tema enviando la nueva lista de IDs con su orden. */
    reorderSubtopics(items: ReorderSubtopicDto[]): Observable<void> {
        return this.http.patch<void>(`${API_BASE}/subtopics/reorder`, items);
    }

    /** Elimina un subtema por su ID. */
    deleteSubtopic(subtopicId: number | string): Observable<void> {
        return this.http.delete<void>(`${API_BASE}/subtopics/${subtopicId}`);
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
            order: 0,
            lesson: { id: Number(lessonId) } as Lesson,
            delete: false
        };
        return this.http.post<ElementTypeObj>(`${API_BASE}/elements`, payload);
    }



    /** Crea una lista no ordenada con sus ítems en una lección. */
    createLesson(lessonId: number | string, preview: ElementTypeObj[]): Observable<ElementTypeObj> {
        let elements: LessonElementDto[] = [];
        for (const [order, el] of preview.entries()) {
            switch (el.type) {
                case 'element': {
                    elements.push({
                        id: el.id,
                        text: el.text,
                        style: el.style,
                        type: 'element',
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: el.delete,
                        gridId: el.gridId,
                        gridCols: el.gridCols,
                    } as CreateElementDto)
                    break;
                }
                case 'title':
                    elements.push({
                        id: el.id,
                        text: el.text,
                        style: '',
                        type: 'title',
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        baseStyle: '',
                        delete: el.delete,
                        gridId: el.gridId,
                        gridCols: el.gridCols,
                    } as CreateTitleDto)
                    break;
                case 'subtitle':
                    elements.push({
                        id: el.id,
                        text: el.text,
                        style: '',
                        type: 'subtitle',
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        baseStyle: '',
                        delete: el.delete,
                        gridId: el.gridId,
                        gridCols: el.gridCols,
                    } as CreateSubtitleDto)
                    break;
                case 'unorderedList':
                    const lis = (el as UnorderedList).list.map((li, i): CreateElementDto => ({
                        id: li.id,
                        text: li.text,
                        style: '',
                        type: 'listItem',
                        order: i,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: li.delete,
                    }));

                    elements.push({
                        id: el.id,
                        text: '',
                        style: '',
                        type: 'unorderedList',
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        baseStyle: 'ul',
                        list: lis,
                        delete: el.delete,
                        gridId: el.gridId,
                        gridCols: el.gridCols,
                    } as CreateUnorderedListDto)
                    break;
                case 'tag':
                    elements.push({
                        id: el.id,
                        text: el.text,
                        style: el.style,
                        type: 'tag',
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: el.delete,
                        gridId: el.gridId,
                        gridCols: el.gridCols,
                    } as CreateElementDto)
                    break;
                case 'tip':
                    const tp = el as Tip;
                    elements.push({
                        id: tp.id,
                        tipTitle: tp.tipTitle,
                        text: tp.text,
                        style: tp.style,
                        type: 'tip',
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: tp.delete,
                        gridId: tp.gridId,
                        gridCols: tp.gridCols,
                    } as CreateElementDto)
                    break;
                case 'table':
                    const aux = el as Table;
                    elements.push({
                        id: aux.id,
                        text: aux.text,
                        style: aux.style,
                        type: 'table',
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: aux.delete,
                        baseStyle: aux.baseStyle,
                        headers: aux.headers,
                        rows: aux.rows,
                        gridId: aux.gridId,
                        gridCols: aux.gridCols,
                    } as CreateTableDto)
                    break;
                case 'conjugation':
                    const auxc = el as Conjugation;
                    elements.push({
                        id: auxc.id,
                        text: auxc.text,
                        style: auxc.style,
                        type: auxc.type,
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: auxc.delete,
                        gridId: auxc.gridId,
                        gridCols: auxc.gridCols,
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
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: auxq.delete,
                        gridId: auxq.gridId,
                        gridCols: auxq.gridCols,
                        questions: auxq.questions,
                    } as CreateQuizDto)
                    break;
                case 'image':
                    elements.push({
                        id: el.id,
                        text: el.text,
                        style: el.style,
                        type: 'image',
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: el.delete,
                        gridId: el.gridId,
                        gridCols: el.gridCols,
                    } as CreateElementDto)
                    break;
                case 'dragDrop':
                    const auxd = el as DragDropExercise;
                    elements.push({
                        id: auxd.id,
                        text: auxd.text,
                        style: auxd.style,
                        type: auxd.type,
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: auxd.delete,
                        words: auxd.words,
                        rows: auxd.rows,
                        gridId: auxd.gridId,
                        gridCols: auxd.gridCols,
                    } as CreateDragDropDto)
                    break;
                case 'pronunciationBlock':
                    const auxp = el as PronunciationBlock;
                    elements.push({
                        id: auxp.id,
                        text: auxp.text,
                        style: auxp.style,
                        type: auxp.type,
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: auxp.delete,
                        items: auxp.items,
                        gridId: auxp.gridId,
                        gridCols: auxp.gridCols,
                    } as CreatePronunciationBlockDto)
                    break;
                case 'fillBlank':
                    const auxf = el as FillBlankExercise;
                    elements.push({
                        id: auxf.id,
                        text: auxf.text,
                        style: auxf.style,
                        type: auxf.type,
                        order,
                        lesson: { id: Number(lessonId) } as Lesson,
                        delete: auxf.delete,
                        rows: auxf.rows,
                        gridId: auxf.gridId,
                        gridCols: auxf.gridCols,
                    } as CreateFillBlankDto)
                    break;
                default:
                    console.warn(`Element type ${el.type} is not supported for creation yet.`);
                    break;
            }
        }

        console.log('Prepared elements for creation:', elements);
        const payload: CreateBodyLessonDto = {
            lesson: { id: Number(lessonId) } as Lesson,
            elements: elements
        };
        console.log(payload);
        return this.http.post<ElementTypeObj>(`${API_BASE}/elements/create-lesson`, payload);
    }

    /** Sube una imagen al servidor y devuelve su ruta. */
    uploadImage(file: File): Observable<{ filename: string; path: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ filename: string; path: string }>(`${API_BASE}/elements/upload-image`, formData);
    }

    /** Genera o modifica elementos de lección mediante IA. */
    genAiLesson(
        prompt: string,
        currentElements: ElementTypeObj[] | null,
        chatHistory: unknown[],
    ): Observable<{ elements: ElementTypeObj[]; message: string; chatHistory: unknown[] }> {
        return this.http.post<{ elements: ElementTypeObj[]; message: string; chatHistory: unknown[] }>(
            `${API_BASE}/ai/generate-lesson`,
            { prompt, currentElements, chatHistory },
        );
    }

}
