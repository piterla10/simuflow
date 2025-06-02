import { Component, EventEmitter, inject, Injectable, OnInit, Output } from '@angular/core';
import { FormularioService } from '../../services/FormularioService';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-crear',
  imports: [ReactiveFormsModule],
  templateUrl: './crear.component.html',
  styleUrl: './crear.component.scss'
})
export class CrearComponent implements OnInit{
  constructor(private formularioService: FormularioService, private router: Router) {  }
  @Output() cambiar = new EventEmitter<number>();
  
  form!: FormGroup;
  
  ngOnInit(): void {
    this.form = new FormGroup({
      nombre: new FormControl('', Validators.required),
      ancho: new FormControl('', Validators.required),
      alto: new FormControl('', Validators.required),
    });
  }

  cambiarComp(n: number) {
    this.cambiar.emit(n); 
  }

  enviarFormulario() {
     if (this.form.valid) {
      this.formularioService.setDatos(this.form.value);
      this.router.navigate(['/simulador']);
    }
  }

}
