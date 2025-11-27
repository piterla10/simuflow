import { Cell, Tuberia } from "./Cell";

export class Agente3{
    mu: number = 0.01;
    memoria: number = 0;
    percepcion: number = 0;
    influencia: number = 0;

    percept(tuberia: Cell){
        this.percepcion = 0;
        const tub = tuberia.content as Tuberia;
        this.percepcion = tub.presionActual;
        this.mem();
        this.decision(tub);
        this.exec();
    }

    mem(){
        let distancia = Math.abs(this.percepcion - this.memoria);
        if(distancia >= this.mu){
            this.memoria = this.percepcion;
        }
    }

    decision(tub: Tuberia){
        // De las dos de abajo comenta la que no vayas a usar o algo:

        // FORMA DE HACERLO CON LOS PARAMETROS INTRODUCIDOS A LA TUBERÍA DE PRESION MAX Y MIN
        if(this.percepcion < tub.presionMin){
            this.influencia = 1;
        }else if(tub.presionMin <= this.percepcion && this.percepcion <= tub.presionMax){
            this.influencia = 0;
        }else if(tub.presionMax <= this.percepcion){
            this.influencia = -1;
        }
        
        // FORMA DE HACERLO CON LOS VALORES FIJOS
        // if(this.percepcion < 40){
        //     this.influencia = 1;
        // }else if(40 <= this.percepcion && this.percepcion < 42){
        //     this.influencia = 1 - (this.percepcion - 40) / 2;
        // }else if(42 <= this.percepcion && this.percepcion <= 54){
        //     this.influencia = 0;
        // }else if(54 < this.percepcion && this.percepcion <= 56){
        //     this.influencia = - (this.percepcion - 54) / 2;
        // }else if(this.percepcion < 56){
        //     this.influencia = -1;
        // }
    }

    exec(){

    }
}