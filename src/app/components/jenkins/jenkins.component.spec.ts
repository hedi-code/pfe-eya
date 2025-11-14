import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JenkinsComponent } from './jenkins.component';

describe('JenkinsComponent', () => {
  let component: JenkinsComponent;
  let fixture: ComponentFixture<JenkinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JenkinsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JenkinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
