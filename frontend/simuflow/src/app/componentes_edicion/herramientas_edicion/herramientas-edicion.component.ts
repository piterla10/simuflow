import { Component, EventEmitter, Output, output } from '@angular/core';

@Component({
  selector: 'app-herramientas-edicion',
  imports: [],
  templateUrl: './herramientas-edicion.component.html',
  styleUrl: './herramientas-edicion.component.scss'
})
export class HerramientasEdicionComponent {
  @Output() herramientaSimulador = new EventEmitter<string>();
  // para el cambiar las herramientas seleccionadas
  public herramientaActiva: 'seleccionar' | 'mover' | 'lapiz' | 'borrador' = 'seleccionar';

  // seleccionamos la herramienta para darle el css
  setHerramienta(herramienta: 'seleccionar' | 'mover' | 'lapiz' | 'borrador' = 'seleccionar'){
    this.herramientaActiva = herramienta;
    this.mandarHerramienta();
  }

  // mandamos la herramienta al padre para que cambie de logica al clicar
  mandarHerramienta(){
    this.herramientaSimulador.emit(this.herramientaActiva);
  }
}
