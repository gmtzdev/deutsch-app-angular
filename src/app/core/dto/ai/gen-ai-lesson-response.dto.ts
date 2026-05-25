import { LessonElementDto } from "../../types";
import { ChatMessage } from "./chat-message.dto";

export interface GenAILessonResponse {
  elements: LessonElementDto[];
  message: string;
  chatHistory: ChatMessage[];
}