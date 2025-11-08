// Definimos los tipos de elementos posibles
export type ElementType = 'generador' | 'deposito' | 'consumo' | 'tuberia';

// Interfaz base común para todos los elementos
interface BaseElement {
  tipo: ElementType;
  id: number;
  sistema: {id: number, porcentaje: number}[];
}

// Interfaces específicas para cada tipo de elemento
interface Generador extends BaseElement {
  tipo: 'generador';
  produccion: number;
  cantidadMax: number; // cantidad maxima que es capaz de generar abierto al maximo
  // minimoRango: number; // momento en el que se apagaría el generador cuando genera 
                          // por debajo de este porcentaje. De momento no se tendrá en cuenta

  // esto representará también el color, ya que lo que hace cambiarlo es cambiar la imagen
  imagen: string; 
  //peligro: Array<number> | null;
}

interface Deposito extends BaseElement {
  tipo: 'deposito';
  solera: number;
  alturaMax: number;
  capacidad: number;
  alturaActual: number;
  imagen: string;
  peligro: Array<number> | null;
}

interface ZonaConsumo extends BaseElement {
  tipo: 'consumo';
  // demanda: number; Esto habría que ver como hacerlo para relacionarlo con peligro
  
  imagen: string;
  datosSimulacion: Array<number>;
  // peligro: Array<number> | null;
}

interface Tuberia extends BaseElement {
  tipo: 'tuberia';
  presionMax: number;
  presionMin: number; 
  presionActual: number; // esto imagino que habrá que cambiarlo en el caso de que la presión 
                         // se asigne automaticamente dependiendo del tanque y tal
  imagen: string;
  // flujoAgua: CellPosition;
  peligro: Array<number> | null;
}


// Tipo union que representa cualquier elemento posible
export type CellElement = Generador | Deposito | ZonaConsumo | Tuberia;

export interface Cell {
  fila: number;
  columna: number;
  content: CellElement | null;
}