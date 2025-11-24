import { Component, EventEmitter, Output } from '@angular/core';
import { Herramienta } from '../../services/Herramienta';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-herramientas-simulacion',
  imports: [CommonModule],
  templateUrl: './herramientas-simulacion.component.html',
  styleUrl: './herramientas-simulacion.component.scss'
})
export class HerramientasSimulacionComponent {
  @Output() herramientaSimulador = new EventEmitter<Herramienta>();
  public herramientaActiva: 'pause' | 'play' = 'pause';

  setHerramienta(herramienta: Herramienta){
    //esto del agente es para controlar los modales
    if(herramienta === 'play'){
      this.herramientaActiva = 'play';
    }else if(herramienta === 'pause'){
      this.herramientaActiva = 'pause';
    }
    
    this.mandarHerramienta(herramienta);
  }

  mandarHerramienta(herramienta: Herramienta){
    this.herramientaSimulador.emit(herramienta);
  }
}
