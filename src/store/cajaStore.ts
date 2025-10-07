import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Ingreso {
  id: string;
  fecha: string;
  importe: number;
  categoria: string;
  habiaCambio: boolean;
  cambioInicial?: number;
  comentario?: string;
  metodoPago: string;
  confirmado: boolean;
}

export interface Gasto {
  id: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  importe: number;
  metodoPago: string;
  nombrePersona?: string;
  estado: "PENDIENTE" | "PAGADO";
}

export interface Compromiso {
  id: string;
  concepto: string;
  categoria?: string;
  importePrevisto: number;
  estado: "PREVISTO" | "CONTRATADO" | "CUMPLIDO";
  gastoId?: string;
}

interface CajaState {
  ingresos: Ingreso[];
  gastos: Gasto[];
  compromisos: Compromiso[];
  addIngreso: (ingreso: Ingreso) => void;
  addGasto: (gasto: Gasto) => void;
  addCompromiso: (compromiso: Compromiso) => void;
}

export const useCajaStore = create<CajaState>()(
  persist(
    (set) => ({
      ingresos: [],
      gastos: [],
      compromisos: [],
      addIngreso: (ingreso) =>
        set((state) => ({ ingresos: [...state.ingresos, ingreso] })),
      addGasto: (gasto) =>
        set((state) => ({ gastos: [...state.gastos, gasto] })),
      addCompromiso: (compromiso) =>
        set((state) => ({ compromisos: [...state.compromisos, compromiso] })),
    }),
    {
      name: "caja-storage", // clave en localStorage
    }
  )
);