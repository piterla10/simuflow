import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControladoresComponent } from './controladores.component';

describe('ControladoresComponent', () => {
  let component: ControladoresComponent;
  let fixture: ComponentFixture<ControladoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControladoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControladoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
