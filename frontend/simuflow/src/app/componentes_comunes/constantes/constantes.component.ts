import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-constantes',
  imports: [CommonModule],
  templateUrl: './constantes.component.html',
  styleUrl: './constantes.component.scss'
})
export class ConstantesComponent {
  public visible = false;

  abrirModal() {
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
  }
}
