import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HerramientasSimulacionComponent } from './herramientas-simulacion.component';

describe('HerramientasSimulacionComponent', () => {
  let component: HerramientasSimulacionComponent;
  let fixture: ComponentFixture<HerramientasSimulacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HerramientasSimulacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HerramientasSimulacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
