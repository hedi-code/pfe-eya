import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotComponent } from './chatbot.component';

describe('ChatbotComponent', () => {
  let component: ChatbotComponent;
  let fixture: ComponentFixture<ChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have welcome message on init', () => {
    expect(component.messages.length).toBeGreaterThan(0);
    expect(component.messages[0].sender).toBe('bot');
  });

  it('should send message when user input is provided', () => {
    component.userInput = 'What is QA?';
    const initialLength = component.messages.length;
    component.sendMessage();
    expect(component.messages.length).toBe(initialLength + 1);
    expect(component.messages[component.messages.length - 1].sender).toBe('user');
  });

  it('should not send empty messages', () => {
    component.userInput = '   ';
    const initialLength = component.messages.length;
    component.sendMessage();
    expect(component.messages.length).toBe(initialLength);
  });

  it('should clear chat history', () => {
    component.messages = [
      { id: 1, content: 'Test', sender: 'user', timestamp: new Date() },
      { id: 2, content: 'Response', sender: 'bot', timestamp: new Date() }
    ];
    component.clearChat();
    expect(component.messages.length).toBe(1);
    expect(component.messages[0].sender).toBe('bot');
  });
});
