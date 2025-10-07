import type { Ingreso, Gasto } from "@/store/cajaStore";

export const ingresosMock: Ingreso[] = [
  { id: "", fecha: "2025-10-04", categoria: "Facturación", comentario: "Facturación fin de 04/10", importe: 1985, metodoPago: "Efectivo", habiaCambio: false, cambioInicial: 0, confirmado: true },
  { id: "", fecha: "2025-10-04", categoria: "Facturación", comentario: "Cambio inicial", importe: 170, metodoPago: "Efectivo", habiaCambio: true, cambioInicial: 170, confirmado: true },
  { id: "", fecha: "2025-10-04", categoria: "Lotería", comentario: "Papeletas", importe: 1944, metodoPago: "Pendiente", habiaCambio: false, cambioInicial: 0, confirmado: false },
  { id: "", fecha: "2025-10-04", categoria: "Lotería", comentario: "Décimos", importe: 150, metodoPago: "Pendiente", habiaCambio: false, cambioInicial: 0, confirmado: false },
];

export const gastosMock: Gasto[] = [
  { id: "", fecha: "2025-10-04", categoria: "Proveedores", descripcion: "Pedido Proveedor", importe: 1120, metodoPago: "Pendiente", estado: "PAGADO" },
  { id: "", fecha: "2025-10-04", categoria: "Uno de nosotros", descripcion: "Chuches", importe: 41.84, metodoPago: "Pendiente", nombrePersona: "Jesús", estado: "PAGADO" },
  { id: "", fecha: "2025-10-04", categoria: "Uno de nosotros", descripcion: "Luces Fiestas", importe: 100, metodoPago: "Pendiente", nombrePersona: "Luca", estado: "PAGADO" },
  { id: "", fecha: "2025-10-04", categoria: "Uno de nosotros", descripcion: "Caja Registradora", importe: 30, metodoPago: "Pendiente", nombrePersona: "Petit", estado: "PAGADO" },
  { id: "", fecha: "2025-10-04", categoria: "Uno de nosotros", descripcion: "Bridas, cinta", importe: 4, metodoPago: "Pendiente", nombrePersona: "Javi", estado: "PAGADO" },
  { id: "", fecha: "2025-10-04", categoria: "Cambio", descripcion: "Cambio", importe: 20, metodoPago: "Pendiente", nombrePersona: "Javi", estado: "PAGADO" },
  { id: "", fecha: "2025-10-04", categoria: "Carteles", descripcion: "Carteles", importe: 7.6, metodoPago: "Pendiente", nombrePersona: "Jesús", estado: "PAGADO" },
  { id: "", fecha: "2025-10-04", categoria: "Limpieza", descripcion: "Gastos Limpieza", importe: 8.92, metodoPago: "Pendiente", nombrePersona: "Jesús", estado: "PAGADO" },
  { id: "", fecha: "2025-10-04", categoria: "Cambio", descripcion: "Cambio", importe: 150, metodoPago: "Pendiente", nombrePersona: "Jesús", estado: "PAGADO" },
  { id: "", fecha: "2025-10-04", categoria: "Hielo", descripcion: "Hielos", importe: 25, metodoPago: "Pendiente", nombrePersona: "Jesús", estado: "PAGADO" },
];