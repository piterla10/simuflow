import { Component } from '@angular/core';
import { CargarCrearComponent } from "../../componentes_inicio/cargar-crear/cargar-crear.component";
import { CargarComponent } from "../../componentes_inicio/cargar/cargar.component";
import { CrearComponent } from '../../componentes_inicio/crear/crear.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-inicio',
  imports: [CargarCrearComponent, CargarComponent, CrearComponent, CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {
  comp = 0;

  cambiarComp(ncomp: any) {
    this.comp = ncomp;
  }
}
