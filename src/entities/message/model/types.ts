export interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  isError?: boolean;
}
