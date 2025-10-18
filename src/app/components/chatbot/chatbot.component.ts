import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: Message[] = [];
  userInput: string = '';
  isTyping: boolean = false;
  private shouldScroll: boolean = false;

  // Mock QA responses database
  private qaDatabase: { [key: string]: string } = {
    'what is qa': 'QA (Quality Assurance) is a systematic process of checking whether a product or service meets specified requirements. It involves testing and verifying that software functions correctly and meets quality standards.',
    'what is testing': 'Software testing is the process of evaluating and verifying that a software product or application does what it is supposed to do. The benefits include preventing bugs, reducing development costs, and improving performance.',
    'types of testing': 'There are several types of testing including:\n• Unit Testing - Testing individual components\n• Integration Testing - Testing combined parts\n• Functional Testing - Testing against requirements\n• Regression Testing - Testing after changes\n• Performance Testing - Testing speed and scalability\n• Security Testing - Testing for vulnerabilities',
    'what is bug': 'A bug is an error, flaw, or fault in a computer program or system that causes it to produce an incorrect or unexpected result, or to behave in unintended ways.',
    'test case': 'A test case is a set of conditions or variables under which a tester will determine whether a system under test satisfies requirements or works correctly. It includes test data, preconditions, expected results, and postconditions.',
    'automation testing': 'Automation testing uses specialized tools to execute tests automatically, manage test data, and utilize results to improve software quality. It\'s best for repetitive tasks, regression testing, and large test suites.',
    'manual testing': 'Manual testing is the process where testers manually execute test cases without using any automation tools. It\'s essential for exploratory, usability, and ad-hoc testing scenarios.',
    'agile testing': 'Agile testing is a software testing practice that follows the principles of agile software development. Testing is integrated throughout the development lifecycle rather than being a separate phase.',
    'regression testing': 'Regression testing is re-running functional and non-functional tests to ensure that previously developed and tested software still performs correctly after a change.',
    'smoke testing': 'Smoke testing is a preliminary test to reveal simple failures severe enough to reject a prospective software release. It\'s a quick, broad test to check if the basic functionality works.',
    'how to report bug': 'To report a bug effectively:\n1. Provide a clear title\n2. Describe steps to reproduce\n3. Include expected vs actual results\n4. Add screenshots or videos if possible\n5. Specify environment details (OS, browser, version)\n6. Assign priority and severity\n7. Include any error messages',
    'test plan': 'A test plan is a document describing the scope, approach, resources, and schedule of intended testing activities. It identifies test items, features to be tested, testing tasks, responsibilities, and risks.',
    'selenium': 'Selenium is a popular open-source framework for automating web browsers. It supports multiple programming languages and browsers, making it ideal for web application testing.',
    'api testing': 'API testing involves testing application programming interfaces (APIs) directly to validate functionality, reliability, performance, and security. Common tools include Postman, REST Assured, and SoapUI.',
    'performance testing': 'Performance testing evaluates the speed, responsiveness, and stability of a system under a particular workload. It includes load testing, stress testing, and scalability testing.'
  };

  ngOnInit() {
    // Welcome message
    this.messages.push({
      id: 1,
      content: 'Hello! I\'m your QA Assistant. I can help answer questions about quality assurance, testing, and related topics. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: this.messages.length + 1,
      content: this.userInput,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    this.shouldScroll = true;

    const userQuery = this.userInput.toLowerCase();
    this.userInput = '';

    // Show typing indicator
    this.isTyping = true;

    // Simulate bot thinking time
    setTimeout(() => {
      this.isTyping = false;
      const botResponse = this.getBotResponse(userQuery);

      const botMessage: Message = {
        id: this.messages.length + 1,
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      this.messages.push(botMessage);
      this.shouldScroll = true;
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  }

  private getBotResponse(query: string): string {
    // Check for exact or partial matches in the QA database
    for (const [key, value] of Object.entries(this.qaDatabase)) {
      if (query.includes(key)) {
        return value;
      }
    }

    // Check for greeting
    if (query.match(/\b(hi|hello|hey|greetings)\b/)) {
      return 'Hello! How can I assist you with your QA questions today?';
    }

    // Check for thanks
    if (query.match(/\b(thanks|thank you|appreciate)\b/)) {
      return 'You\'re welcome! Feel free to ask if you have more questions about QA or testing.';
    }

    // Check for help
    if (query.match(/\b(help|assist|support)\b/)) {
      return 'I can help you with questions about:\n• QA and Testing fundamentals\n• Different types of testing\n• Test automation\n• Bug reporting\n• Testing tools (Selenium, API testing, etc.)\n• Test planning and documentation\n\nJust ask me anything!';
    }

    // Default response for unknown queries
    return 'I\'m not sure about that specific question. I can help with topics like QA basics, testing types, automation, bug reporting, and testing tools. Could you rephrase your question or ask about one of these topics?';
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat() {
    this.messages = [{
      id: 1,
      content: 'Chat cleared. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }];
    this.shouldScroll = true;
  }
}
