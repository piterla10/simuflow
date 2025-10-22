import { Component, Input, OnInit, viewChild, ViewChild } from '@angular/core';
import { NavbarComponent } from "../../componentes_comunes/navbar/navbar.component";
import { ArchivoService } from '../../services/ArchivoService';
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
import { BasuraComponent } from '../../componentes_edicion/basura/basura.component';
import { ControladoresComponent } from '../../componentes_edicion/controladores/controladores.component';

@Component({
  selector: 'app-simulador',
  imports: [NavbarComponent, CommonModule, HerramientasEdicionComponent, HerramientasSimulacionComponent, CrearElementoComponent, ElementoDetallesComponent, BasuraComponent, ControladoresComponent],
  templateUrl: './simulador.component.html',
  styleUrl: './simulador.component.scss'
})
export class SimuladorComponent implements OnInit {
  // para utilizar las funciones de abrir y cerrar modal 
  @ViewChild('elemento') modalCrearElemento!: CrearElementoComponent;
  @ViewChild('basura') modalBasura!: BasuraComponent;
  @ViewChild('elementoDetalles') modalElementoDetalles!: ElementoDetallesComponent;

  constructor(private archivoService: ArchivoService, 
    private simulacionService: SimulacionService){}
  
  // Esta variable es para guardar la suscripción del observable que
  // se utiliza para guardar los datos del grid y tal. Se podría
  // hacer sin variable pero al utilizarla luego se puede destruir
  // en ngOnDestroy y se evitan fugas de memoria.
  private saveSubscription!: Subscription;

  // para el manejo del Grid
  // publico para que se pueda acceder desde el html
  public filas!: number;
  public columnas!: number;
  public flatGrid: Cell[] = [];
  public celdaSeleccionada: Cell | null = null;
  private idElemento: number = 0;
  
  // datos que recibimos de inicio
  private datos: any;
      // esto ya se usará cuanto toque ponerse con lo de guardar el archivo en una bd
  private archivo: File | null = null; 

  // para cambiar las herramientas seleccionadas
  public modoActivo: 'edicion' | 'simulacion' = 'edicion';
  public herramientaEdicion: Herramienta = 'seleccionar'
  public elemento: Elemento = 'generador';

  // variable para controlar el modal activo
  private modalActual: string | null = null;

  ngOnInit(){

    // Habrá que hacer que se guarde también la variable flatGrid en localhost para
    // que al recuperar el sistema no solo se coloquen las celdas sino también los elementos con las 
    // disposiciones que tenían previamente y tal

    // guardamos los datos del sistema
    const datosJSON = localStorage.getItem('datosGrid');
    this.archivo = this.archivoService.getArchivo();

    if(datosJSON){
      this.datos = JSON.parse(datosJSON);
      this.filas = this.datos.filas;
      this.columnas = this.datos.columnas;
    }

    const flatGridJSON = localStorage.getItem('flatGrid');
    if (flatGridJSON) {
      // hacemos que se cree el proxy de flatGrid para que se guarde automáticamente
      this.flatGrid = JSON.parse(flatGridJSON);
    } else {
      this.createGrid();
      // guardo por primera vez en localStorage
      localStorage.setItem('flatGrid', JSON.stringify(this.flatGrid));
    }

    // guardamos la suscripción en la variable y le asignamos que llame a 
    // guardarDatosSimulación() cuando se haga .next() en el service
    this.saveSubscription = this.simulacionService.saveRequested$.subscribe(() => {
      this.guardarDatosSimulacion();
    });
  }

  // destructor de la variable que estaba pendiente de si se clica el guardar
  ngOnDestroy() {
    this.saveSubscription.unsubscribe();
  }

  // --------------------------------------- SELECCIÓN DE MODO Y CAMBIO DE HERRAMIENTA ---------------------------------------

  // Función para cambiar de modo
  setModo(modo: 'edicion' | 'simulacion'){
    this.modoActivo = modo;
    if(modo === 'simulacion'){
      this.celdaSeleccionada = null;

      // cerramos los modales que pudieran estar abiertos
      if(this.modalActual){
        this.cerrarModales(this.modalActual);
      }
    }
    if(modo === 'edicion'){
      this.herramientaEdicion = 'seleccionar';
    }
  }

  // para que el clicar en una herramienta haga que el modo edición se 
  // comporte de una forma u otra
  cambioHerramienta(herramienta: Herramienta){
    // cerramos el modal que pueda estar abierto cuando se cambie de herramienta
    if(this.modalActual){
      this.cerrarModales(this.modalActual);
    }
    // si celdaSeleccionada tiene contenido la ponemos a null
    this.celdaSeleccionada && (this.celdaSeleccionada = null);

    switch(herramienta){
      case 'seleccionar':
        this.herramientaEdicion = herramienta;
        break;
      case 'mover':
        this.herramientaEdicion = herramienta;
        break;
      case 'lapiz':
        this.abrirModales('crearElemento');
        this.herramientaEdicion = herramienta;
        break;
      case 'borrador':
        this.herramientaEdicion = herramienta;
        break;
      case 'basura':
        this.abrirModales('basura');
        break;
      case 'agente':
        // habrá que hacer esto pero con los modales del agente
        // if(this.crearElemento.visible){
        //   this.cerrarModales('crearElemento');
        // }else{
        //   this.abrirModales('crearElemento');
        // }
        break;
    }
  }

  // --------------------------------------- CONTROLADORES PARA ABRIR Y CERRAR MODALES ---------------------------------------

  // no es perfecto porque si por ejemplo un modal se cierra desde la x, la variable modalActual 
  // no se habrá actualizado pero aun así funcionaría ya que al abrir otro modal, se intentaría 
  // volver a cerrar el que ya estaba cerrado y se abriría el nuevo
  abrirModales(nombreModal: string){
    switch(nombreModal){
      case 'crearElemento':
        this.modalCrearElemento.abrirModal();
        break;
      case 'basura':
        this.modalBasura.abrirModal();
        break;
      case 'elementoDetalles':
        this.modalElementoDetalles.abrirModal();
        break;
    }
    this.modalActual = nombreModal;
  }

  cerrarModales(nombreModal: string){
    switch(nombreModal){
      case 'crearElemento':
        this.modalCrearElemento.cerrarModal();  
        break;
      case 'basura':
        this.modalBasura.cerrarModal();
        break;
      case 'elementoDetalles':
        this.modalElementoDetalles.cerrarModal();
        break;
      case '':
        // este caso es para cerrar todos los modales que puedan estar abiertos
        this.modalCrearElemento.cerrarModal();
        this.modalBasura.cerrarModal();
        this.modalElementoDetalles.cerrarModal();
        break;
    }
      this.modalActual = null;
  }

// --------------------------------------- GESTIÓN DEL CLICK EN EL CANVAS Y LAS FUNCIONES DE LAS HERRAMIENTAS ---------------------------------------

  // Controlador del comportamiento de los clicks en el canvas según 
  // la herramienta seleccionada
  controladorCanvas(cell: Cell){
    if(this.modoActivo === 'edicion'){
      switch(this.herramientaEdicion){
        case 'seleccionar':
          this.seleccionar(cell);
          break;
        case 'mover':
          this.mover(cell);
          break;
        case 'lapiz':
          this.lapiz(cell);
          break;
        case 'borrador':
          this.borrador(cell);
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
    if(this.celdaSeleccionada === cell){
      //desde aquí se cierra el modal
      this.cerrarModales('elementoDetalles')
      this.celdaSeleccionada = null;
    }else if(cell.content){
      this.celdaSeleccionada = cell;
      this.abrirModales('elementoDetalles');
    }
    
    // guardamos en localstorage
    this.guardarGrid();

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

      // si tenemos una seleccionada y la queremos cambiar por otra con contenido
    } else if(this.celdaSeleccionada && cell.content && this.celdaSeleccionada !== cell){
      const aux = this.celdaSeleccionada.content;
      this.celdaSeleccionada.content = cell.content;
      cell.content = aux;
      this.celdaSeleccionada = null;

      // si la celda que hemos seleccionado es la misma que teníamos ya seleccionada
      // ponemos la celda seleccionada a null
    } else if(this.celdaSeleccionada == cell){
      this.celdaSeleccionada = null;
    }
    // guardamos en localstorage
    this.guardarGrid();
  }

  private generarId(): number{
    return this.idElemento++;
  }

  // función para seleccionar el elemento a poner en el canvas
  cambioElemento(elemento: Elemento){
    this.elemento = elemento;
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
            id: this.generarId(),
            tipo: 'consumo',
            imagen: 'assets/elementos/consumo_blanco.png',
            datosSimulacion: [0],
            // peligro: null
          };
        break;
      case 'deposito':
        contenido = {
            id: this.generarId(),
            tipo: 'deposito', 
            altura: 1,
            capacidad: 5,
            contenidoActual: 2.5,
            imagen: 'assets/elementos/deposito_blanco_4.png',
            datosSimulacion: [0],
            peligro: null
          };
        break;
      case 'generador':
          contenido = {
            id: this.generarId(),
            tipo: 'generador',
            imagen: 'assets/elementos/desaladora_blanco.png',
            datosSimulacion: [0],
            // peligro: null
          };
        break;
      case 'tuberia':
        contenido = {
            id: this.generarId(),
            tipo: 'tuberia',
            presionMax: 10,
            presionActual: 5,
            imagen: 'assets/elementos/tuberia_blanco.png',
            peligro: null
          };
        break;
      }
      // esto funcionaría para todo menos las tuberías, habrá que tenerlo en cuenta
      
      celdaGrid!.content = contenido;
      // guardamos en localstorage
      this.guardarGrid();
    }
  }

  // funcion del borrador de eliminar el contenido de una celda
  borrador(cell:Cell){
    cell.content = null;
    // guardamos en localstorage
    this.guardarGrid();
  }

  // función de la basura para eliminar todo el contenido 
  confirmarBorrado(){
    // recorrer el array de this.flatGrid y vaciarlo entero
    // en un futuro habrá que también borrar los agentes controladores
    for (let i = 0; i < this.flatGrid.length; i++) {
      this.flatGrid[i].content = null;
    }
    // guardamos en localstorage
    this.guardarGrid();
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
    }
  }

// --------------------------------------- CREACIÓN DEL GRID Y MANEJO DEL GUARDADO Y CARGA DE DATOS ---------------------------------------
  // función para guardar los datos en la bd
  guardarDatosSimulacion() {
    // Aquí iría la llamada al servicio para guardar en BD
    // this.simulationService.guardarEnBD(datosParaGuardar);
  }

  // para crear el grid
  createGrid(): void {
    for (let i = 0; i < this.filas; i++) {
      for (let j = 0; j < this.columnas; j++) {
        const cell = { fila: i, columna: j, content: null };
        this.flatGrid.push(cell);
      }
    }
  }

// -------------------------------- FUNCION PARA EL GUARDADO EN LOCALSTORAGE  ----------------------------

  guardarGrid(){
    localStorage.setItem('flatGrid', JSON.stringify(this.flatGrid));
  }

}

