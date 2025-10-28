import { Component, OnInit } from '@angular/core';
import { CargarCrearComponent } from "../../componentes_inicio/cargar-crear/cargar-crear.component";
import { CargarComponent } from "../../componentes_inicio/cargar/cargar.component";
import { CrearComponent } from '../../componentes_inicio/crear/crear.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-inicio',
  imports: [CargarCrearComponent, CargarComponent, CrearComponent, CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit{
  comp = 0;

  constructor( private router: Router) {  }

  ngOnInit(): void {
    const flatGridJSON = localStorage.getItem('datosGrid');
    if(flatGridJSON){
      this.router.navigate(['/simulador']);
    } 
  }

  cambiarComp(ncomp: any) {
    this.comp = ncomp;
  }
}
