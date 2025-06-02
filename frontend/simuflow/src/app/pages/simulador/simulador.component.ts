import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../componentes_comunes/navbar/navbar.component";
import { FormularioService } from '../../services/FormularioService';

@Component({
  selector: 'app-simulador',
  imports: [NavbarComponent],
  templateUrl: './simulador.component.html',
  styleUrl: './simulador.component.scss'
})
export class SimuladorComponent implements OnInit {
  constructor(private formularioService: FormularioService){}

  ngOnInit(){
    const datos = this.formularioService.getDatos();
    console.log(datos);
  }

}
