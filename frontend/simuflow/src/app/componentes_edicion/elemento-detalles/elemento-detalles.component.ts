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

  // para manejar la visibilidad del modal y los colores de los elementos
  visible = false;
  colorCelda = 1;

  // variables a rellenar en caso de que la celda contenga una zona de consumo
  datosSim = "0";

  // variables a rellenar en caso de que la celda contenga un depósito
  solera: number = 1;
  alturaMax: number = 2.5;
  capacidad: number = 5;
  alturaActual: number = 1;

  // variables a rellenar en caso de que la celda contenga un generador
  produccion: number = 0;
  cantidadMax: number = 30;

  // variables a rellenar en caso de que la celda contenga una tubería
  presionMaxima: number = 10;
  presionMinima: number = 1;


  ngOnChanges(): void {
    // si todavía no se ha recibido el input, salimos
    if (!this.celda) {
      return;
    }
    
    // para detectar el color de la celda
    this.colorActual();

    // para inicializar los valores que se mostrarán en cada campo del elemento al seleccionarlo
    if(this.celda.content?.tipo === "deposito"){
      this.solera = this.celda.content.solera;
      this.alturaActual = this.celda.content.alturaActual;
      this.capacidad = this.celda.content.capacidad;
      this.alturaMax = this.celda.content.alturaMax;

    }else if(this.celda.content?.tipo === "generador"){
      this.produccion = this.celda.content.produccion;
      this.cantidadMax = this.celda.content.cantidadMax;

    }else if(this.celda.content?.tipo === "tuberia"){
      this.presionMaxima = this.celda.content.presionMax;
      this.presionMinima = this.celda.content.presionMin;
    
    }else if(this.celda.content?.tipo === "consumo"){
      this.datosSim = this.celda.content!.datosSimulacion.join(', ');
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
  
  // esto sirve para todo el tema de los colores de las imágenes junto con las dos funciones de abajo
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
  procesarDatosSimulacion(){
    if('datosSimulacion' in this.celda.content!){
      this.celda.content.datosSimulacion = this.datosSim
        .split(',')
        .map(n => Number(n.trim()))
        .filter(n => !isNaN(n));
    }
  }

  // funciones para guardar los datos cambiados de los elementos en tiempo real si es un depósito
  procesarSolera(){
    if('solera' in this.celda.content!)
      this.celda.content!.solera = this.solera;
  }

  procesarAlturaMax(){
    if('alturaMax' in this.celda.content!)
      this.celda.content!.alturaMax = this.alturaMax;
  }

  procesarCapacidad(){
    if('capacidad' in this.celda.content!)
      this.celda.content!.capacidad = this.capacidad;
  }

  procesarAlturaActual(){
    if('alturaActual' in this.celda.content!)
      this.celda.content!.alturaActual = this.alturaActual;
  }

  // funciones para guardar los datos cambiados de los elementos en tiempo real si es un generador
  procesarProduccion(){
    // comprobamos que no lo deje en blanco para que no sea nulo
    if (isNaN(this.produccion)) {
      this.produccion = 0;
    }

    // Limitar entre 0 y 1
    if (this.produccion < 0) {
      this.produccion = 0;
    } else if (this.produccion > 1) {
      this.produccion = 1;
    }
    if('produccion' in this.celda.content!)
      this.celda.content!.produccion = this.produccion;
  }
  procesarCantidadMax(){
    if('cantidadMax' in this.celda.content!)
      this.celda.content!.cantidadMax = this.cantidadMax;
  }

  // funciones para guardar los datos cambiados de los elementos en tiempo real si es una tubería
  procesarPresionMaxima(){
    if('presionMax' in this.celda.content!)
      this.celda.content!.presionMax = this.presionMaxima;
  }
  procesarPresionMinima(){
    if('presionMin' in this.celda.content!)
      this.celda.content!.presionMin = this.presionMinima;
  }
}
