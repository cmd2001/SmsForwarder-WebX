export interface Conversation {
  conversation_id: number;
  peer_number: string;
  via_line_number: string;
  last_message_content: string;
  last_message_time: string;
  last_message_is_unread: boolean;
}
