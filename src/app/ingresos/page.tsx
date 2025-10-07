"use client";

import { useState } from "react";
import { useCajaStore } from "@/store/cajaStore";
import { v4 as uuidv4 } from "uuid";

export default function IngresosPage() {
  const addIngreso = useCajaStore((state) => state.addIngreso);

  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [importe, setImporte] = useState(0);
  const [comentario, setComentario] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [categoria, setCategoria] = useState("");
  const [habiaCambio, setHabiaCambio] = useState(false);
  const [cambioInicial, setCambioInicial] = useState(0);
  const [confirmado, setConfirmado] = useState(true);

  const handleSave = () => {
    addIngreso({
      id: uuidv4(),
      fecha,
      importe,
      categoria,
      habiaCambio,
      cambioInicial,
      comentario,
      metodoPago,
      confirmado,
    });
    setFecha(new Date().toISOString().split("T")[0]);
    setImporte(0);
    setComentario("");
    setMetodoPago("Efectivo");
    setCategoria("");
    setHabiaCambio(false);
    setCambioInicial(0);
    setConfirmado(true);
    alert("Ingreso registrado ✅");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20 flex flex-col items-center w-full">
      <main className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-4">Registrar Ingreso</h1>

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="fecha">
          Fecha
        </label>
        <input
          id="fecha"
          type="date"
          className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="importe">
          Importe (€)
        </label>
        <input
          id="importe"
          type="number"
          className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={importe}
          onChange={(e) => setImporte(Number(e.target.value))}
        />

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="habiaCambio">
          <input
            id="habiaCambio"
            type="checkbox"
            className="mr-2"
            checked={habiaCambio}
            onChange={(e) => setHabiaCambio(e.target.checked)}
          />
          ¿Había cambio?
        </label>

        {habiaCambio && (
          <>
            <label className="block mb-2 font-semibold text-gray-900" htmlFor="cambioInicial">
              Cambio inicial (€)
            </label>
            <input
              id="cambioInicial"
              type="number"
              className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              value={cambioInicial}
              onChange={(e) => setCambioInicial(Number(e.target.value))}
            />
          </>
        )}

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="categoria">
          Categoría
        </label>
        <select
          id="categoria"
          className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Seleccione una categoría</option>
          <option value="Barra">Barra</option>
          <option value="Evento">Evento</option>
          <option value="Otros ingresos">Otros ingresos</option>
        </select>

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="comentario">
          Comentario (opcional)
        </label>
        <textarea
          id="comentario"
          className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          placeholder="Comentario (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="metodoPago">
          Método de Pago
        </label>
        <select
          id="metodoPago"
          className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="Efectivo">Efectivo</option>
          <option value="Bizum">Bizum</option>
          <option value="Tarjeta">Tarjeta</option>
        </select>

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="confirmado">
          <input
            id="confirmado"
            type="checkbox"
            className="mr-2"
            checked={confirmado}
            onChange={(e) => setConfirmado(e.target.checked)}
          />
          Confirmado (si no está marcado, se guarda como previsto)
        </label>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Guardar Ingreso
        </button>
      </main>
    </div>
  );
}