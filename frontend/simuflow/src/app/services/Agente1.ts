import { Cell, Deposito } from "./Cell";

export class Agente1{
    mu: number = 0.01;
    memoria: number[] = [];
    percepcion: number[] = [];
    influencia: number = 0;
    Dl: number[] = [];

    percept(depositos: Cell[]){
        this.percepcion = [];
        depositos.forEach(dep =>{
            const deposito = dep.content as Deposito;
            this.percepcion.push(deposito.alturaActual);
        });
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
        this.Dl = [];
        this.percepcion.forEach(valor =>{
            if (valor < 0.5){
                this.Dl.push(1);

            }else if(0.5 <= valor && valor <= 0.6){
                this.Dl.push((0.6 - valor) * 10);

            }else if(0.6 < valor && valor < 0.9){
                this.Dl.push(0);

            }else if(0.9 <= valor && valor<= 1){
                this.Dl.push((0.9 - valor) * 10);
                
            }else if(valor>1 ){
                this.Dl.push(-1);
            } 
        });
        let suma = 0;
        this.Dl.forEach(valor => suma += valor);
        this.influencia = suma / this.Dl.length;
    }

    exec(){

    }
}