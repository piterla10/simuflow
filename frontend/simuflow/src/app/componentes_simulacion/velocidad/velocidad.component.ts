import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-velocidad',
  imports: [CommonModule, FormsModule],
  templateUrl: './velocidad.component.html',
  styleUrl: './velocidad.component.scss'
})
export class VelocidadComponent implements OnChanges{
  @Input() ItiempoCiclo!: number;
  @Input() ItiempoTranscurrido!: number;
  @Output() EEtiempoCiclo = new EventEmitter<number>();
  @Output() EEtiempoTranscurrido = new EventEmitter<number>();
  public tiempoCiclo: number = 1000;
  public tiempoTranscurrido: number = 600000;

  public visible = false;

  ngOnChanges(): void {
    this.tiempoCiclo = this.ItiempoCiclo;
    this.tiempoTranscurrido = this.ItiempoTranscurrido;
  }

  abrirModal() {
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
  }

  procesarTiempoCiclo(){
    this.EEtiempoCiclo.emit(this.tiempoCiclo);
  }

  procesarTiempoTranscurrido(){
    this.EEtiempoTranscurrido.emit(this.tiempoTranscurrido);
  }
}
