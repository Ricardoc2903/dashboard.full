// src/types.ts

export interface Equipo {
    id: string;
    nombre: string;
    tipo: string;
    ubicacion: string;
    fechaAdquisicion?: string;
    estado: "activo" | "en mantenimiento" | "fuera de servicio";
  }
  
  export interface Mantenimiento {
    id: string;
    nombre: string;
    fecha: string;
    equipo: string;
    estado: "activo" | "en mantenimiento" | "fuera de servicio";
    notas: string;
  }
  