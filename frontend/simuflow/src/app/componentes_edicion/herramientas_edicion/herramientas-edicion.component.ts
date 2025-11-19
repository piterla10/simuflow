import { Component, EventEmitter, Output } from '@angular/core';
import { Herramienta } from '../../services/Herramienta';

@Component({
  selector: 'app-herramientas-edicion',
  imports: [],
  templateUrl: './herramientas-edicion.component.html',
  styleUrl: './herramientas-edicion.component.scss'
})
export class HerramientasEdicionComponent {
  @Output() herramientaSimulador = new EventEmitter<Herramienta>();
  // para el cambiar las herramientas seleccionadas
  public herramientaActiva: Herramienta = 'seleccionar';

  // seleccionamos la herramienta para darle el css
  setHerramienta(herramienta: Herramienta){
    //esto del agente es para controlar los modales
    if(herramienta != 'basura'){
      this.herramientaActiva = herramienta;
    }
    this.mandarHerramienta(herramienta);
  }

  // mandamos la herramienta al padre para que cambie de logica al clicar
  mandarHerramienta(herramienta: Herramienta){
    this.herramientaSimulador.emit(herramienta);
  }
}
