import { Component, EventEmitter, inject, Injectable, OnInit, Output } from '@angular/core';
import { InicioService } from '../../services/InicioService';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-crear',
  imports: [ReactiveFormsModule],
  templateUrl: './crear.component.html',
  styleUrl: './crear.component.scss'
})
export class CrearComponent implements OnInit{
  constructor(private inicioService: InicioService, private router: Router) {  }
  @Output() cambiar = new EventEmitter<number>();
  
  cambiarComp(n: number) {
    this.cambiar.emit(n); 
  }
  
  form!: FormGroup;
  
  ngOnInit(): void {
    this.form = new FormGroup({
      nombre: new FormControl('', Validators.required),
      filas: new FormControl('', Validators.required),
      columnas: new FormControl('', Validators.required),
    });
  }


  enviarFormulario() {
     if (this.form.valid) {
      this.inicioService.setDatos(this.form.value);
      this.router.navigate(['/simulador']);
    }
  }

}
