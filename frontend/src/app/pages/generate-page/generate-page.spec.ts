import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratePage } from './generate-page';

describe('GeneratePage', () => {
  let component: GeneratePage;
  let fixture: ComponentFixture<GeneratePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
