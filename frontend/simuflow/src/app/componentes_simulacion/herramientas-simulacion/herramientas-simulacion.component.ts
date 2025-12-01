import { Component, EventEmitter, Output, OnChanges, SimpleChanges, Input } from '@angular/core';
import { Herramienta } from '../../services/Herramienta';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-herramientas-simulacion',
  imports: [CommonModule],
  templateUrl: './herramientas-simulacion.component.html',
  styleUrl: './herramientas-simulacion.component.scss'
})
export class HerramientasSimulacionComponent implements OnChanges{
  @Input() vistaCambiada!: 'grid' | 'grafico';
  @Output() herramientaSimulador = new EventEmitter<Herramienta>();
  public herramientaActiva: 'pause' | 'play' = 'pause';
  public vistaActiva: 'grid' | 'grafico' = 'grid';

  ngOnChanges(): void {
    // si aun no ha llegado el valor de vistaCambiada volvemos
    if(!this.vistaCambiada){
      return;
    }

    // cuando se actualiza el valor de vista cambiada desde el simulador, la variable de aquí
    // que se encarga de mostrar un símbolo u otro en la barra de herramientas aún no está
    // actualizada, así que la asignamos desde aquí.
    if(this.vistaActiva !== this.vistaCambiada)
    this.vistaActiva = this.vistaCambiada;
  }

  setHerramienta(herramienta: Herramienta){
    //esto del agente es para controlar los modales
    if(herramienta === 'play'){
      this.herramientaActiva = 'play';
    }else if(herramienta === 'pause'){
      this.herramientaActiva = 'pause';
    }

    if(herramienta === 'grafico'){
      this.vistaActiva = 'grafico';
    }else if(herramienta === 'grid'){
      this.vistaActiva = 'grid';
    }
    
    this.mandarHerramienta(herramienta);
  }

  mandarHerramienta(herramienta: Herramienta){
    this.herramientaSimulador.emit(herramienta);
  }
}
