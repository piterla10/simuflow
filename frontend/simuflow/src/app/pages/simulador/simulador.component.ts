import { Component, Input, OnInit, viewChild, ViewChild } from '@angular/core';
import { NavbarComponent } from "../../componentes_comunes/navbar/navbar.component";
import { InicioService } from '../../services/InicioService';
import { Cell, CellElement } from '../../services/Cell';
import { CommonModule } from '@angular/common';
import { SimulacionService } from '../../services/SimulacionService';
import { Subscription } from 'rxjs';
import { HerramientasEdicionComponent } from "../../componentes_edicion/herramientas_edicion/herramientas-edicion.component";
import { HerramientasSimulacionComponent } from "../../componentes_simulacion/herramientas-simulacion/herramientas-simulacion.component";
import { Herramienta } from '../../services/Herramienta';
import { Elemento } from '../../services/Elemento';
import { CrearElementoComponent } from "../../componentes_edicion/crear-elemento/crear-elemento.component";
import { ElementoDetallesComponent } from "../../componentes_edicion/elemento-detalles/elemento-detalles.component";

@Component({
  selector: 'app-simulador',
  imports: [NavbarComponent, CommonModule, HerramientasEdicionComponent, HerramientasSimulacionComponent, CrearElementoComponent, ElementoDetallesComponent],
  templateUrl: './simulador.component.html',
  styleUrl: './simulador.component.scss'
})
export class SimuladorComponent implements OnInit {
  // para utilizar las funciones de abrir y cerrar modal 
  @ViewChild('elemento') modalCrearelemento!: CrearElementoComponent;

  constructor(private inicioService: InicioService, 
    private simulacionService: SimulacionService){}
  
  // Para llamar al servicio que guardará en la bd
  private saveSubscription!: Subscription;

  // para el manejo del Grid
  // publico para que se pueda acceder desde el html
  public filas!: number;
  public columnas!: number;
  public flatGrid: Cell[] = [];
  public celdaSeleccionada: Cell | null = null;
  
  // datos que recibimos de inicio
  private datos: any;
  private archivo: File | null = null;

  // para el cambiar las herramientas seleccionadas
  public modoActivo: 'edicion' | 'simulacion' = 'edicion';
  public herramientaEdicion: Herramienta = 'seleccionar'
  public elemento: Elemento = 'generador';

  // variable para controlar el modal activo
  private modalActual: string | null = null;

  ngOnInit(){
    // guardamos los datos del sistema
    this.datos = this.inicioService.getDatos();
    this.archivo = this.inicioService.getArchivo();

    if(this.datos){
      this.filas = this.datos.filas;
      this.columnas = this.datos.columnas;
    }
    
    console.log(this.datos);
    console.log(this.archivo);

    // Creamos el grid 
    this.createGrid();

    this.saveSubscription = this.simulacionService.saveRequested$.subscribe(() => {
      this.guardarDatosSimulacion();
    });
  }

  // destructor de la variable que estaba pendiente de si se clica el guardar
  ngOnDestroy() {
    this.saveSubscription.unsubscribe();
  }

  // Función para cambiar de modo
  setModo(modo: 'edicion' | 'simulacion'){
    this.modoActivo = modo;
    if(modo === 'simulacion'){
      this.celdaSeleccionada = null;
    }
    // cerramos el modal del lapiz en caso de que estuviera abierto 
    if(this.modalCrearelemento.visible){
      this.modalCrearelemento.cerrarModal();
    }
  }

  // función para seleccionar el elemento a poner en el canvas
  cambioElemento(elemento: Elemento){
    this.elemento = elemento;
    console.log(elemento)
  }

  // para que el clicar en una herramienta haga que el modo edición se 
  // comporte de una forma u otra
  cambioHerramienta(herramienta: Herramienta){
    switch(herramienta){
      case 'seleccionar':
        this.cerrarModales('');
        this.herramientaEdicion = herramienta;
        break;
      case 'mover':
        this.cerrarModales('');
        this.herramientaEdicion = herramienta;
        break;
      case 'lapiz':
        if(this.modalCrearelemento.visible){
          this.cerrarModales('elementoHijo');
        }else{
          this.abrirModales('elementoHijo');
        }
        this.herramientaEdicion = herramienta;
        break;
      case 'borrador':
        this.cerrarModales('');
        this.herramientaEdicion = herramienta;
        break;
      case 'basura':
        // habrá que hacer esto pero con los modales de la basura
        // if(this.elementoHijo.visible){
        //   this.cerrarModales('elementoHijo');
        // }else{
        //   this.abrirModales('elementoHijo');
        // }
        break;
      case 'agente':
        // habrá que hacer esto pero con los modales del agente
        // if(this.elementoHijo.visible){
        //   this.cerrarModales('elementoHijo');
        // }else{
        //   this.abrirModales('elementoHijo');
        // }
        break;
    }
  }

  // Controladores para abrir y cerrar modales
  abrirModales(nombreModal: string){
    if (this.modalActual && this.modalActual !== nombreModal) {
      this.cerrarModales(this.modalActual);
    }

    switch(nombreModal){
      case 'elementoHijo':
        this.modalCrearelemento.abrirModal();
        break;
      case '':
        
        break;
    }
    this.modalActual = nombreModal;
  }

  cerrarModales(nombreModal: string){
    switch(nombreModal){
      case 'elementoHijo':
        this.modalCrearelemento.cerrarModal();  
        break;
      case 'otroModal':

        break;
      case '':
        this.modalCrearelemento.cerrarModal();
        break;
    }
    if(this.modalActual === nombreModal){
      this.modalActual = null;
    }
  }

  // Controlador del comportamiento de los clicks en el canvas según 
  // la herramienta seleccionada
  controladorCanvas(cell: Cell){
    if(this.modoActivo === 'edicion'){
      switch(this.herramientaEdicion){
        case 'seleccionar':

          break;
        case 'mover':

          this.mover(cell);
          break;
        case 'lapiz':
          this.lapiz(cell);
          break;
        case 'borrador':

          break;
      }
    }else{
      // en este caso se seleccionaría el elemento y se podrían ver sus
      // detalles con el modal correspondiente, quizá capando la opción
      // de editar sus datos, con otro modal o modificando el que exista
    }
  }

  // para ver el contenido de una celda
  seleccionar(cell: Cell){
    // Si clicamos en una celda vacía se pone celdaSeleccionada a null
    // y cerramos el modal que pueda estar abierto de detalles del contenido
    // si la celda clicada tiene contenido entonces abrimos el modal y lo enseñamos
  }

  // para mover el contenido de una celda a otra
  mover(cell: Cell){
    // si ya teníamos una celda previamente seleccionada y la que hemos clicado no 
    // tiene contenido entonces se le cambia de la anterior a esa
    if (this.celdaSeleccionada && !cell.content) {
      // Lógica para mover el contenido si hay uno seleccionado
      cell.content = this.celdaSeleccionada.content;
      this.celdaSeleccionada.content = null;
      this.celdaSeleccionada = null;

      // si no teníamos una seleccionada, la seleccionamos
    } else if (!this.celdaSeleccionada && cell.content) {
      this.celdaSeleccionada = cell;

      // si la celda que hemos seleccionado es la misma que teníamos ya seleccionada
      // ponemos la celda seleccionada a null
    } else if(this.celdaSeleccionada == cell){
      this.celdaSeleccionada = null;
    }
  }

  // para crear elementos en el sistema
  lapiz(cell:Cell){
    if(!cell.content){
      const celdaGrid = this.flatGrid.find(
        (celda) => celda.fila === cell.fila && celda.columna === cell.columna);
        
      let contenido: CellElement;
      switch(this.elemento){
      case 'consumo':
        contenido = {
            tipo: 'generador', // no se si hará falta poner esto
            imagen: 'assets/elementos/desaladora_blanca.png',
            datosSimulacion: [0],
            peligro: null
          };
          
        break;
      case 'deposito':
        contenido = {
            tipo: 'generador', // no se si hará falta poner esto
            imagen: 'assets/elementos/desaladora_blanca.png',
            datosSimulacion: [0],
            peligro: null
          };
        break;
      case 'generador':
          contenido = {
            tipo: 'generador', // no se si hará falta poner esto
            imagen: 'assets/elementos/desaladora_blanca.png',
            datosSimulacion: [0],
            peligro: null
          };

        break;
      case 'tuberia':
        contenido = {
            tipo: 'generador', // no se si hará falta poner esto
            imagen: 'assets/elementos/desaladora_blanca.png',
            datosSimulacion: [0],
            peligro: null
          };
        break;
      }
      celdaGrid!.content = contenido;
    }
  }

  infoElemento(elemento: CellElement): string{
    switch (elemento.tipo) {
      case 'generador':
          return `${elemento.datosSimulacion.join(', ')}`;
      case 'deposito':
            const contenido = elemento.contenidoActual / elemento.capacidad * 100;
          return `${contenido} %`;
      case 'consumo':
          return `${elemento.datosSimulacion.join(', ')}`;
      case 'tuberia':
          return `${elemento.presionActual}`;
      default:
          return '';
    }
  }

  // función para guardar los datos en ls bd
  guardarDatosSimulacion() {
    // Aquí iría la llamada al servicio para guardar en BD
    // this.simulationService.guardarEnBD(datosParaGuardar);
  }

  // para crear el grid
  createGrid(): void {
    this.flatGrid = [];
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const cell = { fila: i, columna: j, content: null };
        this.flatGrid.push(cell);
      }
    }
  }
}
