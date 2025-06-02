import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../componentes_comunes/navbar/navbar.component";
import { InicioService } from '../../services/InicioService';

@Component({
  selector: 'app-simulador',
  imports: [NavbarComponent],
  templateUrl: './simulador.component.html',
  styleUrl: './simulador.component.scss'
})
export class SimuladorComponent implements OnInit {
  constructor(private inicioService: InicioService){}
  datos: any;
  archivo: File | null = null;

  ngOnInit(){
    this.datos = this.inicioService.getDatos();
    this.archivo = this.inicioService.getArchivo();
    console.log(this.datos);
    console.log(this.archivo);
  }

}
