import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Metadata } from '../../services/metadata';

@Component({
  selector: 'app-detalle',
  imports: [RouterLink],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css'
})
export class Detalle implements OnInit {
  contenido: Metadata | null = null;
  cargando = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private metadata: Metadata,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const tipo = this.route.snapshot.paramMap.get('tipo');
    const id = this.route.snapshot.paramMap.get('id');

    if (!tipo || !id) {
      this.error = 'No se encontró el contenido.';
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    const solicitud = tipo === 'tv'
      ? this.metadata.obtenerSerie(id)
      : this.metadata.obtenerPelicula(id);

    solicitud.subscribe({
      next: (respuesta) => {
        this.contenido = respuesta;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el detalle:', error);
        this.error = 'No se pudo cargar el contenido.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}