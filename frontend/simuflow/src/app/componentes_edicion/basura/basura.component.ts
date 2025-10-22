import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-basura',
  imports: [CommonModule],
  templateUrl: './basura.component.html',
  styleUrl: './basura.component.scss'
})
export class BasuraComponent {
  @Output() borrar = new EventEmitter<number>();
  visible = false;

  abrirModal(){
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
  }

  confirmar(){
    this.borrar.emit();
    this.visible = false;
  }
}
