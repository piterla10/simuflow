import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Cell } from '../../services/Cell';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-elemento-detalles',
  imports: [CommonModule, FormsModule],
  templateUrl: './elemento-detalles.component.html',
  styleUrl: './elemento-detalles.component.scss'
})
export class ElementoDetallesComponent implements OnChanges{
  @Input() celda!: Cell;
  @Output() actualizar = new EventEmitter<Cell>();

  visible = false;
  datosSim = '';
  colorCelda = 1;

  // variables a rellenar en caso de que la celda contenga un depósito
  altura!: number;
  capacidad!: number;
  contenidoActual!: number;

  ngOnChanges(): void {
    if (!this.celda) { // si todavía no se ha recibido el input, salimos
      this.datosSim = '';
      this.altura = 1;
      this.capacidad = 10;
      this.contenidoActual = 5;
      return;
    }
    
    // para detectar el color de la celda
    this.colorActual();
    console.log(this.colorCelda)
    if('datosSimulacion' in this.celda.content!){
      this.datosSim = this.celda.content!.datosSimulacion.join(', ');
    } else {
      this.datosSim = '';
    }

    if(this.celda.content?.tipo === "deposito"){
      this.altura = this.celda.content.altura;
      this.capacidad = this.celda.content.capacidad;
      this.contenidoActual = this.celda.content.contenidoActual;
    }
  }


  abrirModal(){
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
  }

  // Esto es solamente para que a parte de que se cierre el modal también se 
  // ponga this.celdaSeleccionada del padre a null
  cerrarDesdeBoton(){
    this.actualizar.emit(this.celda);
  }
  
  colores = [
    { id: 1, color: '#ffffffff', nombre: 'blanco'},
    { id: 2, color: '#e0e0e0', nombre: 'gris'},
    { id: 3, color: '#FFD6A5', nombre:'durazno'},
    { id: 4, color: '#D8B4F8', nombre: 'lavanda'},
    { id: 5, color: '#CDEAC0', nombre: 'verde'},
    { id: 6, color: '#A2D2FF', nombre: 'azul'}
  ];

  colorActual(){
    for(const col of this.colores){
      if(this.celda.content?.imagen.includes(col.nombre)){
        this.colorCelda = col.id;
        return;
      }
    }
  }

  // función para cambiar el "color"
  colorSeleccionado(color: number){
    // buscamos los nombres de los colores
    const colActual = this.colores.find(c => c.id === this.colorCelda);
    const colNuevo = this.colores.find(c => c.id === color);

    // como tal esto es solo para que el código no se queje ya que nunca debería de ejecutarse
    if (!colActual || !colNuevo || !this.celda.content) return;

    // cambiamos el string y se lo asignamos a la celda
    this.celda.content.imagen = this.celda.content.imagen.replace(colActual.nombre!, colNuevo.nombre!);
    
    // actualizamos el valor de colorCelda para el css y tener referencia para un posible futuro cambio
    this.colorCelda = color;
  }

  // función para guardar los números que servirán como datos de simulación 
  // mientras no esté funcionando el agente controlador
  procesar(){
    if('datosSimulacion' in this.celda.content!){
      this.celda.content.datosSimulacion = this.datosSim
        .split(',')
        .map(n => Number(n.trim()))
        .filter(n => !isNaN(n));
    }
  }

  // funciones para guardar los datos cambiados de los elementos en tiempo real
  procesarAltura(){
    if('altura' in this.celda.content!)
      this.celda.content!.altura = this.altura;
  }

  procesarCapacidad(){
    if('capacidad' in this.celda.content!)
      this.celda.content!.capacidad = this.capacidad;
  }

  procesarContenido(){
    if('contenidoActual' in this.celda.content!)
      this.celda.content!.contenidoActual = this.contenidoActual;
  }
}
