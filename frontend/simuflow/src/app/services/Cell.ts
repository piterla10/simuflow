// Definimos los tipos de elementos posibles
export type ElementType = 'generador' | 'deposito' | 'consumo' | 'tuberia';

// Interfaz base común para todos los elementos
interface BaseElement {
  tipo: ElementType;
}

// Interfaces específicas para cada tipo de elemento
interface Generador extends BaseElement {
  tipo: 'generador';
  // esto representará también el color, ya que lo que hace cambiarlo es cambiar la imagen
  imagen: string; 
  datosSimulacion: Array<number>;
  peligro: Array<number> | null;
}

interface Deposito extends BaseElement {
  tipo: 'deposito';
  capacidad: number;
  contenidoActual: number;
  // esto representará también el color, ya que lo que hace cambiarlo es cambiar la imagen
  imagen: string;
  datosSimulacion: Array<number>;
  peligro: Array<number> | null;
}

interface ZonaConsumo extends BaseElement {
  tipo: 'consumo';
  // demanda: number; Esto habría que ver como hacerlo para relacionarlo con peligro
  
  // esto representará también el color, ya que lo que hace cambiarlo es cambiar la imagen
  imagen: string;
  datosSimulacion: Array<number>;
  peligro: Array<number> | null;
}

interface Tuberia extends BaseElement {
  tipo: 'tuberia';
  presionMax: number;
  presionActual: number;
  // habrá que diseñar el sistema este de grafos para hacer las conexiones
  // conectaDesde: CellPosition;
  // conectaHasta: CellPosition;

  // esto representará también el color, ya que lo que hace cambiarlo es cambiar la imagen
  imagen: string;
  flujoAgua: CellPosition;
  peligro: Array<number> | null;
}

interface CellPosition {
  fila: number;
  columna: number;
}

// Tipo union que representa cualquier elemento posible
export type CellElement = Generador | Deposito | ZonaConsumo | Tuberia;

export interface Cell {
  fila: number;
  columna: number;
  content: CellElement | null;
}