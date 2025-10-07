import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-elemento-detalles',
  imports: [CommonModule],
  templateUrl: './elemento-detalles.component.html',
  styleUrl: './elemento-detalles.component.scss'
})
export class ElementoDetallesComponent {
  visible = false;

  abrirModal(){
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
  }
}
