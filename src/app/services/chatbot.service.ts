import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$: Observable<Message[]> = this.messagesSubject.asObservable();

  private messageIdCounter = 1;

  // Mock QA Knowledge Base
  private qaKnowledgeBase: { [key: string]: string } = {
    'what is qa': 'QA (Quality Assurance) is a systematic process of checking whether a product or service meets specified requirements. It involves testing and verifying that software functions correctly and meets quality standards before release.',

    'what is testing': 'Software testing is the process of evaluating and verifying that a software product or application does what it is supposed to do. The benefits include preventing bugs, reducing development costs, improving performance, and ensuring user satisfaction.',

    'types of testing': 'There are several types of testing including:\n\n• Unit Testing - Testing individual components or modules\n• Integration Testing - Testing how modules work together\n• Functional Testing - Testing against functional requirements\n• Regression Testing - Testing after changes to ensure no new bugs\n• Performance Testing - Testing speed, scalability, and stability\n• Security Testing - Testing for vulnerabilities and threats\n• User Acceptance Testing (UAT) - Testing by end users\n• Smoke Testing - Basic sanity checks\n• Load Testing - Testing under expected load conditions',

    'what is bug': 'A bug is an error, flaw, or fault in a computer program or system that causes it to produce an incorrect or unexpected result, or to behave in unintended ways. Bugs can range from minor issues to critical system failures.',

    'test case': 'A test case is a set of conditions or variables under which a tester will determine whether a system under test satisfies requirements or works correctly. A test case typically includes:\n• Test case ID\n• Test description\n• Preconditions\n• Test steps\n• Test data\n• Expected results\n• Actual results\n• Pass/Fail status',

    'automation testing': 'Automation testing uses specialized software tools to execute tests automatically, manage test data, and utilize results to improve software quality. Benefits include:\n• Faster execution\n• Reusability of test scripts\n• Better for repetitive tasks\n• Improved accuracy\n• Cost-effective for regression testing\n• Continuous integration support\n\nPopular tools: Selenium, Cypress, Playwright, Appium',

    'manual testing': 'Manual testing is the process where testers manually execute test cases without using automation tools. It\'s essential for:\n• Exploratory testing\n• Usability testing\n• Ad-hoc testing\n• New feature testing\n• Test scenarios that are difficult to automate\n\nIt provides human insight and intuition that automation cannot replicate.',

    'agile testing': 'Agile testing is a software testing practice that follows the principles of agile software development. Key characteristics:\n• Testing is integrated throughout the development lifecycle\n• Continuous feedback\n• Test-driven development (TDD)\n• Behavior-driven development (BDD)\n• Short iterations\n• Close collaboration between testers and developers\n• Emphasis on working software over comprehensive documentation',

    'regression testing': 'Regression testing is re-running functional and non-functional tests to ensure that previously developed and tested software still performs correctly after a change. It\'s performed when:\n• Bug fixes are implemented\n• New features are added\n• Configuration changes occur\n• Performance improvements are made',

    'smoke testing': 'Smoke testing (also called build verification testing) is a preliminary test to reveal simple failures severe enough to reject a prospective software release. It\'s:\n• Quick and broad (not deep)\n• Tests critical functionality\n• Usually automated\n• Run before more comprehensive testing\n• Helps save time by catching major issues early',

    'how to report bug': 'To report a bug effectively, include:\n\n1. Clear, descriptive title\n2. Steps to reproduce:\n   • Step 1: Do this\n   • Step 2: Then do this\n   • Step 3: Observe the issue\n3. Expected behavior\n4. Actual behavior\n5. Environment details:\n   • OS and version\n   • Browser and version\n   • Application version\n6. Screenshots or videos\n7. Error messages or logs\n8. Priority and severity\n9. Additional context',

    'test plan': 'A test plan is a comprehensive document describing the scope, approach, resources, and schedule of intended testing activities. It includes:\n• Test objectives\n• Test scope (in and out of scope)\n• Test strategy\n• Test environment\n• Entry and exit criteria\n• Test deliverables\n• Resource allocation\n• Risks and mitigations\n• Schedule and milestones\n• Approval process',

    'selenium': 'Selenium is a popular open-source framework for automating web browsers. Features:\n• Supports multiple programming languages (Java, Python, C#, JavaScript, Ruby)\n• Cross-browser testing (Chrome, Firefox, Safari, Edge)\n• Cross-platform (Windows, Mac, Linux)\n• Large community support\n• Integration with testing frameworks\n• Selenium WebDriver for browser automation\n• Selenium Grid for parallel execution\n\nIdeal for web application testing and regression testing.',

    'api testing': 'API testing involves testing application programming interfaces (APIs) directly to validate functionality, reliability, performance, and security. Types:\n• Functional testing - Does it work correctly?\n• Load testing - Can it handle traffic?\n• Security testing - Is it secure?\n• Integration testing - Does it work with other systems?\n\nCommon tools: Postman, REST Assured, SoapUI, Insomnia, Swagger\n\nTypical API tests verify:\n• Response status codes\n• Response time\n• Response data\n• Error handling',

    'performance testing': 'Performance testing evaluates the speed, responsiveness, and stability of a system under a particular workload. Types:\n\n• Load Testing - Testing under expected load\n• Stress Testing - Testing beyond normal capacity\n• Spike Testing - Testing with sudden load increases\n• Endurance Testing - Testing over extended periods\n• Scalability Testing - Testing ability to scale up/down\n\nKey metrics:\n• Response time\n• Throughput\n• Resource utilization\n• Error rate\n\nTools: JMeter, LoadRunner, Gatling, K6',

    'test automation': 'Test automation is the practice of running tests automatically, managing test data, and utilizing results to improve software quality. Best practices:\n• Start with stable, repetitive tests\n• Use page object model (POM)\n• Maintain test data separately\n• Keep tests independent\n• Use descriptive naming\n• Implement proper waits and synchronization\n• Generate reports\n• Integrate with CI/CD\n• Regular maintenance of test scripts',

    'ci cd': 'CI/CD (Continuous Integration/Continuous Deployment) is a method to frequently deliver apps by introducing automation. Benefits:\n• Faster release cycles\n• Early bug detection\n• Reduced manual errors\n• Improved code quality\n• Faster feedback\n\nTesting in CI/CD:\n• Automated unit tests\n• Integration tests\n• Smoke tests\n• Regression tests\n• Performance tests\n\nPopular tools: Jenkins, GitLab CI, GitHub Actions, CircleCI, Travis CI',

    'test coverage': 'Test coverage is a metric that measures the amount of testing performed by a set of tests. Types:\n• Code coverage - Lines/branches of code executed\n• Requirements coverage - Requirements tested\n• Feature coverage - Features tested\n\nGood coverage doesn\'t guarantee quality, but low coverage indicates insufficient testing. Aim for meaningful coverage, not just high percentages.',

    'defect life cycle': 'The defect life cycle (bug life cycle) is the journey of a defect from discovery to closure:\n\n1. New - Defect reported\n2. Assigned - Assigned to developer\n3. Open - Developer starts work\n4. Fixed - Developer fixes the issue\n5. Retest - Tester verifies the fix\n6. Verified - Fix confirmed\n7. Closed - Defect resolved\n\nOther states: Rejected, Deferred, Duplicate, Reopened',

    'test strategy': 'A test strategy is a high-level document that defines the testing approach for a project. It includes:\n• Testing scope and objectives\n• Test levels (unit, integration, system)\n• Test types (functional, non-functional)\n• Entry and exit criteria\n• Test environment requirements\n• Automation approach\n• Risk analysis\n• Testing tools\n• Roles and responsibilities\n\nIt\'s created early in the project and guides all testing activities.',

    'boundary value': 'Boundary Value Analysis (BVA) is a test design technique that focuses on values at boundaries. For a valid range [min, max]:\n• Test: min-1, min, min+1\n• Test: max-1, max, max+1\n\nExample: Input field accepts 1-100\nTest values: 0, 1, 2, 99, 100, 101\n\nBoundaries are where defects often occur, making this an effective testing technique.',

    'equivalence partition': 'Equivalence Partitioning divides input data into partitions of equivalent data from which test cases can be derived. Example:\n\nAge validation (18-65):\n• Invalid partition: < 18\n• Valid partition: 18-65\n• Invalid partition: > 65\n\nTest one value from each partition:\n• Test: 15 (invalid)\n• Test: 30 (valid)\n• Test: 70 (invalid)\n\nReduces test cases while maintaining coverage.',

    'cypress': 'Cypress is a modern, JavaScript-based end-to-end testing framework. Features:\n• Fast, reliable test execution\n• Real-time reloading\n• Automatic waiting\n• Time travel debugging\n• Network traffic control\n• Screenshots and videos\n• Great developer experience\n\nBest for:\n• Modern web applications\n• JavaScript/TypeScript projects\n• E2E and integration testing\n\nLimitations:\n• Browser support (mainly Chrome-based)\n• Single domain per test',

    'playwright': 'Playwright is a modern test automation framework by Microsoft. Features:\n• Multi-browser support (Chromium, Firefox, WebKit)\n• Cross-platform\n• Auto-wait capabilities\n• Network interception\n• Parallel test execution\n• Rich assertions\n• Multiple language support\n\nAdvantages:\n• Faster than Selenium\n• Better reliability\n• Modern API\n• Great for web, mobile web, and API testing',

    'test driven development': 'Test-Driven Development (TDD) is a development approach where tests are written before code. Process:\n\n1. Red - Write a failing test\n2. Green - Write minimum code to pass\n3. Refactor - Improve code quality\n4. Repeat\n\nBenefits:\n• Better code quality\n• Living documentation\n• Fewer bugs\n• Design improvement\n• Confidence in changes\n\nChallenges:\n• Initial learning curve\n• Time investment\n• Requires discipline'
  };

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
   * Send a user message and get bot response
   */
  async sendMessage(content: string): Promise<void> {
    // Add user message
    this.addMessage({
      id: this.messageIdCounter++,
      content,
      sender: 'user',
      timestamp: new Date()
    });

    // Simulate thinking time
    await this.delay(1000 + Math.random() * 1000);

    // Get bot response
    const response = this.getBotResponse(content.toLowerCase());

    // Add bot message
    this.addMessage({
      id: this.messageIdCounter++,
      content: response,
      sender: 'bot',
      timestamp: new Date()
    });
  }

  /**
   * Get bot response based on user query
   */
  private getBotResponse(query: string): string {
    // Check for exact or partial matches in knowledge base
    for (const [key, value] of Object.entries(this.qaKnowledgeBase)) {
      if (query.includes(key)) {
        return value;
      }
    }

    // Check for greetings
    if (query.match(/\b(hi|hello|hey|greetings|bonjour|salut)\b/)) {
      return 'Hello! How can I assist you with your QA questions today?';
    }

    // Check for thanks
    if (query.match(/\b(thanks|thank you|merci|appreciate)\b/)) {
      return 'You\'re welcome! Feel free to ask if you have more questions about QA or testing.';
    }

    // Check for help
    if (query.match(/\b(help|assist|support|aide)\b/)) {
      return 'I can help you with questions about:\n\n• QA and Testing fundamentals\n• Different types of testing (unit, integration, functional, etc.)\n• Test automation (Selenium, Cypress, Playwright)\n• Bug reporting and defect management\n• Testing methodologies (Agile, TDD, BDD)\n• Test planning and documentation\n• API and performance testing\n• CI/CD integration\n\nJust ask me anything!';
    }

    // Check for goodbye
    if (query.match(/\b(bye|goodbye|au revoir|ciao)\b/)) {
      return 'Goodbye! Feel free to come back anytime you have questions about QA or testing. Happy testing!';
    }

    // Check for capabilities question
    if (query.match(/\b(what can you do|capabilities|features)\b/)) {
      return 'I\'m a QA knowledge assistant with expertise in:\n\n✓ Testing fundamentals and methodologies\n✓ Test automation tools and frameworks\n✓ Bug tracking and reporting\n✓ Test planning and strategy\n✓ Performance and security testing\n✓ CI/CD and DevOps practices\n✓ Best practices and guidelines\n\nAsk me specific questions about any of these topics!';
    }

    // Default response for unknown queries
    const suggestions = [
      'What is QA?',
      'Types of testing',
      'How to report a bug?',
      'What is Selenium?',
      'Automation testing',
      'API testing',
      'Performance testing'
    ];

    return `I'm not sure about that specific question. However, I can help with topics like:\n\n${suggestions.map(s => `• ${s}`).join('\n')}\n\nCould you rephrase your question or ask about one of these topics?`;
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

  /**
   * Utility function to simulate delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get suggested questions
   */
  getSuggestedQuestions(): string[] {
    return [
      'What is QA?',
      'Types of testing',
      'How to report a bug?',
      'What is automation testing?',
      'What is Selenium?',
      'What is API testing?',
      'Explain regression testing',
      'What is test plan?',
      'What is Cypress?',
      'What is TDD?'
    ];
  }
}
