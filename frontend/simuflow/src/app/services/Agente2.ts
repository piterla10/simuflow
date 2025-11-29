import { Cell, Generador, ZonaConsumo } from "./Cell";

export class Agente2{
    mu: number = 0.5;
    memoria: number[] = [];
    percepcion: number[] = [];
    influencia: number = 0;
    Di: number[] = [];

    /*
    Para que os sea mas fácil la configuración de este agente, voy a ir explicando con todos los valores que recibe
    percept que es lo que hace falta de cada uno para tener lo que tenéis en vuestro código:
    -WTF es aguaDesdeDeposito
    +WTF es aguaHaciaDeposito
    CC sería el valor de las zonas de consumo junto al paso en el que estamos:
        zonaConsumo.datosSimulacion[paso] para cada zona del sistema

    Lo que puede ser algo más enrevesado es el cómo conseguir WPF que es la cantidad de agua que han generado en cada 
    paso los generadores. Lo normal sería multiplicar el valor de producción de un generador por su capacidad maxima
    de extracción por su porcentaje respectivo al sistema en el que nos encontramos (ya que un deposito puede estar 
    también en varios sistemas), después habría que hacer lo mismo con los demás generadores que hubiera y sumar su valor,
    PERO, ocurre una cosa cuando se tiene más de un sistema y hay un generador en medio. Y es que su valor de producción
    se alteraría dos veces cada paso, una por cada sistema, haciendo así que el valor de producción que se utiliza para
    los calculos del segundo sistema sería distinto al primero. 
    Como se está intentando imitar un sistema real en el que el agua fluiría a la vez en los dos sistemas, lo que se propuso 
    fue utilizar el array "produccion", el cual almacena el valor de producción de todos los generadores que haya en el
    simulador antes de ejecutar cada paso. Esto serviría para utilizar su valor ya que NO CAMBIA con cada ejecución de 
    sistema, es decir, en un mismo paso, el valor sería el mismo para dos sistemas con un generador común. Entonces, para
    utilizar su valor, habría que comprobar cuales de los generadores del array están en el sistema que se está calculando 
    (por si hubiera más de uno) y una vez se ha localizado se haría:
    sumatorio de los generadores -> gen(del array de producción).valor[paso] * generador.cantidadMax * porcentaje del sistema. 

    No se si me he explicado bien, pero espero que sirva. 
    Con todo esto se tendrían los datos que habían en el código anterior para trabajar en este nuevo código.
    */
    percept(generadores: Cell[], produccion: {id: number, valor: number[]}[], zonasConsumo: Cell[], aguaDesdeDeposito: number, aguaHaciaDeposito: number, paso: number){
        this.percepcion = [];
        zonasConsumo.forEach(zona=>{
            const zonaConsumo = zona.content as ZonaConsumo;
            this.percepcion.push(zonaConsumo.datosSimulacion[paso]);
        })
        this.mem();
        this.decision();
        this.exec();
    }

    mem(){
        let valorMemoria = 0;
        let valorPercepcion = 0;
        this.memoria.forEach(valor => valorMemoria += Math.abs(valor));
        this.percepcion.forEach(valor => valorPercepcion += Math.abs(valor));
        let distancia = Math.abs(valorPercepcion - valorMemoria);
        if(distancia >= this.mu){
            this.memoria = this.percepcion;
        }
    }

    decision(){
        this.Di = [];
        this.percepcion.forEach(valor =>{
            if(valor < 45){
                this.Di.push(0);
            }else if(45 <= valor && valor <= 50){
                this.Di.push(-(valor-45) / 5);
            }else if(valor > 50){
                this.Di.push(-1);
            }
        });
        let suma = 0;
        this.Di.forEach(valor => suma += valor);
        this.influencia = suma / this.Di.length;
    }

    exec(){

    }
}