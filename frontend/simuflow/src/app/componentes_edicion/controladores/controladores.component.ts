import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-controladores',
  imports: [CommonModule],
  templateUrl: './controladores.component.html',
  styleUrl: './controladores.component.scss'
})
export class ControladoresComponent {
  @Output() borrar = new EventEmitter<number>();
  visible = false;

  abrirModal(){
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
  }

}
