import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HerramientasEdicionComponent } from './herramientas-edicion.component';

describe('HerramientasEdicionComponent', () => {
  let component: HerramientasEdicionComponent;
  let fixture: ComponentFixture<HerramientasEdicionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HerramientasEdicionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HerramientasEdicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
