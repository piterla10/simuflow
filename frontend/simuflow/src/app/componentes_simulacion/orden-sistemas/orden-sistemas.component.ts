import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { Sistema } from '../../services/Sistema';

@Component({
  selector: 'app-orden-sistemas',
  imports: [CommonModule],
  templateUrl: './orden-sistemas.component.html',
  styleUrl: './orden-sistemas.component.scss'
})
export class OrdenSistemasComponent implements OnChanges{
  @Input() sistemas!: Sistema[];
  public visible = false;
  public sistemaSeleccionado!: number | null;

  ngOnChanges(): void {
    // si aun no se ha recibido el input, salimos
    if(!this.sistemas){
      return;
    }

    // que se cierre el modal si estaba abierto y se ha cambiado algo de los sistemas
    // haciendo que ya no haya más de 1
    if(this.sistemas.length <= 1){
      this.cerrarModal();
    }
  }

  abrirModal() {
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
  }

  seleccionarSistema(id: number){
    // si no tenemos seleccionado ningún sistema seleccionamos el que se ha clicado
    if(!this.sistemaSeleccionado){
      this.sistemaSeleccionado = id;
    // si el sistema seleccionado no es el mismo que teníamos y ya teníamos uno seleccionado
    }else if(id !== this.sistemaSeleccionado){
      const posicionVieja = this.sistemas.findIndex(s => s.id === this.sistemaSeleccionado);
      const posicionNueva = this.sistemas.findIndex(s => s.id === id);

      this.intercambiar(this.sistemas, posicionVieja, posicionNueva);
      this.sistemaSeleccionado = null;
    // si clicamos en el mismo sistema
    }else if(this.sistemaSeleccionado === id){
      this.sistemaSeleccionado = null;
    }
  }

  // función que cambia las posiciones del array
  intercambiar(arr: any[], i: number, j: number) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
