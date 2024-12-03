export interface Message {
  display_time: string;
  content: string;
  type: 'IN' | 'OUT';
  status: 'SENT' | 'READ';
}
