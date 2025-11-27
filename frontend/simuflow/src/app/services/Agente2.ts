import { Cell, Generador, ZonaConsumo } from "./Cell";

export class Agente2{
    mu: number = 0.5;
    memoria: number[] = [];
    percepcion: number[] = [];
    influencia: number = 0;
    Di: number[] = [];

    percept(generadores: Cell[],  produccion: {id: number, valor: number[]}[], zonasConsumo: Cell[], aguaDesdeDeposito: number, aguaHaciaDeposito: number, paso: number){
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