import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';

export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$: Observable<Message[]> = this.messagesSubject.asObservable();

  private messageIdCounter = 1;
  private apiUrl = 'https://eyaelouni.app.n8n.cloud/webhook-test/brain-chat'; // Proxied to n8n webhook

  constructor() {
    // Initialize with welcome message
    this.addMessage({
      id: this.messageIdCounter++,
      content: 'Hello! I\'m your QA Assistant. I can help answer questions about quality assurance, testing methodologies, and best practices. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    });
  }

  /**
   * Get the current messages
   */
  getMessages(): Message[] {
    return this.messagesSubject.value;
  }

  /**
   * Add a new message to the chat
   */
  addMessage(message: Omit<Message, 'id'> | Message): void {
    const messages = this.messagesSubject.value;
    const newMessage: Message = {
      id: 'id' in message ? message.id : this.messageIdCounter++,
      ...message
    };
    this.messagesSubject.next([...messages, newMessage]);
  }

  /**
   * Send a user message and get bot response from API
   */
  async sendMessage(content: string): Promise<void> {
    // Add user message
    this.addMessage({
      id: this.messageIdCounter++,
      content,
      sender: 'user',
      timestamp: new Date()
    });

    try {
      console.log('Calling API:', this.apiUrl);
      console.log('Sending message:', content);

      // Call n8n API
      const response: any = await firstValueFrom(
        this.http.post(this.apiUrl, {
          message: content,
          chatId: 'chatbot-session-' + Date.now()
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      console.log('API Response:', response);

      // Extract response from API
      let botResponse: string;

      // Adapt to different possible response formats
      if (typeof response === 'string') {
        botResponse = response;
      } else if (response?.output) {
        botResponse = response.output;
      } else if (response?.message) {
        botResponse = response.message;
      } else if (response?.response) {
        botResponse = response.response;
      } else if (response?.text) {
        botResponse = response.text;
      } else {
        // If response is an object, try to stringify it nicely
        botResponse = JSON.stringify(response, null, 2);
      }

      console.log('Bot response:', botResponse);

      // Add bot message
      this.addMessage({
        id: this.messageIdCounter++,
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      });
    } catch (error: any) {
      console.error('========== API ERROR ==========');
      console.error('Error calling chatbot API:', error);
      console.error('Error status:', error?.status);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.error);
      console.error('===============================');

      // Show error message to user with more details
      let errorMessage = 'Désolé, je rencontre un problème technique. ';

      if (error?.status === 0) {
        errorMessage += 'Impossible de contacter le serveur (CORS ou connexion). ';
      } else if (error?.status === 404) {
        errorMessage += 'L\'API n\'est pas trouvée. ';
      } else if (error?.status >= 500) {
        errorMessage += 'Le serveur rencontre une erreur. ';
      }

      errorMessage += 'Veuillez réessayer plus tard.';

      this.addMessage({
        id: this.messageIdCounter++,
        content: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      });
    }
  }


  /**
   * Clear all messages except welcome message
   */
  clearMessages(): void {
    this.messageIdCounter = 1;
    this.messagesSubject.next([{
      id: this.messageIdCounter++,
      content: 'Chat cleared. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }]);
  }
}
