export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: any;
  tool_call_id?: string;
  tool_calls?: any[];
}