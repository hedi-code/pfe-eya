import { TestBed } from '@angular/core/testing';
import { ChatbotService } from './chatbot.service';

describe('ChatbotService', () => {
  let service: ChatbotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatbotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a welcome message on initialization', (done) => {
    service.messages$.subscribe(messages => {
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].sender).toBe('bot');
      expect(messages[0].content).toContain('Hello');
      done();
    });
  });

  it('should add user message when sendMessage is called', async () => {
    const initialLength = service.getMessages().length;
    await service.sendMessage('What is QA?');
    const messages = service.getMessages();
    expect(messages.length).toBeGreaterThan(initialLength);
    expect(messages.find(m => m.sender === 'user' && m.content === 'What is QA?')).toBeTruthy();
  });

  it('should add bot response after user message', async () => {
    await service.sendMessage('What is QA?');
    const messages = service.getMessages();
    const botMessages = messages.filter(m => m.sender === 'bot');
    expect(botMessages.length).toBeGreaterThan(1); // Welcome message + response
  });

  it('should clear messages except welcome message', () => {
    service.addMessage({ content: 'Test', sender: 'user', timestamp: new Date() });
    service.clearMessages();
    const messages = service.getMessages();
    expect(messages.length).toBe(1);
    expect(messages[0].sender).toBe('bot');
  });

  it('should return suggested questions', () => {
    const suggestions = service.getSuggestedQuestions();
    expect(suggestions.length).toBeGreaterThan(0);
    expect(Array.isArray(suggestions)).toBe(true);
  });
});
