import { Observable } from 'rxjs';

export interface MessageOwner {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture: string;
}

export interface ConversationResponse {
  id: string;
  sender: MessageOwner;
  receiver: MessageOwner;
  status: string;
}

export interface ChatService {
  createConversation(
    sender: MessageOwner,
    receiver: MessageOwner,
  ): Observable<ConversationResponse>;
}
