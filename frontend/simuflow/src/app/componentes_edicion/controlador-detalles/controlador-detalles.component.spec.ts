import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControladorDetallesComponent } from './controlador-detalles.component';

describe('ControladorDetallesComponent', () => {
  let component: ControladorDetallesComponent;
  let fixture: ComponentFixture<ControladorDetallesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControladorDetallesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControladorDetallesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
