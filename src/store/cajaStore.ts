import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Ingreso {
  id: string;
  fecha: string;
  importe: number;
  categoria: string;
  habiaCambio: boolean;
  cambioInicial?: number;
  comentario?: string;
  metodoPago: string;
}

interface Gasto {
  id: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  importe: number;
  metodoPago: string;
  nombrePersona?: string;
  pagado?: boolean;
}

interface CajaState {
  ingresos: Ingreso[];
  gastos: Gasto[];
  addIngreso: (ingreso: Ingreso) => void;
  addGasto: (gasto: Gasto) => void;
}

export const useCajaStore = create<CajaState>()(
  persist(
    (set) => ({
      ingresos: [],
      gastos: [],
      addIngreso: (ingreso) =>
        set((state) => ({ ingresos: [...state.ingresos, ingreso] })),
      addGasto: (gasto) =>
        set((state) => ({ gastos: [...state.gastos, gasto] })),
    }),
    {
      name: "caja-storage", // clave en localStorage
    }
  )
);