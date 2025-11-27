import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimulacionService } from '../../services/SimulacionService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-constantes',
  imports: [CommonModule, FormsModule],
  templateUrl: './constantes.component.html',
  styleUrl: './constantes.component.scss'
})
export class ConstantesComponent implements OnInit{
  constructor( private simulacionService: SimulacionService){}
  private datosCargados!: Subscription;

  public constantePorConsumo: number = 15;
  public constantePorBombeo: number = 15;

  public visible = false;

  ngOnInit(): void {
    this.datosCargados = this.simulacionService.constantesCargadas$.subscribe(datos =>{
      if(datos){
        this.constantePorConsumo = datos.constantePorConsumo;
        this.constantePorBombeo = datos.constantePorBombeo;
      }
    })
  }

  ngOnDestroy(){
    this.datosCargados?.unsubscribe();
  }

  abrirModal() {
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
  }

  procesarConsumo(){
    this.simulacionService.enviarConstantePorConsumo(this.constantePorConsumo);
  }
  
  procesarBombeo(){
    this.simulacionService.enviarConstantePorBombeo(this.constantePorBombeo);
  }
}
