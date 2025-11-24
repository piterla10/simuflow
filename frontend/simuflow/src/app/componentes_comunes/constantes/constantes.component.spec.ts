import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstantesComponent } from './constantes.component';

describe('ConstantesComponent', () => {
  let component: ConstantesComponent;
  let fixture: ComponentFixture<ConstantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
