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
    });
    setFecha(new Date().toISOString().split("T")[0]);
    setImporte(0);
    setComentario("");
    setMetodoPago("Efectivo");
    setCategoria("");
    setHabiaCambio(false);
    setCambioInicial(0);
    alert("Ingreso registrado ✅");
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Registrar Ingreso</h1>

      <label className="block mb-2 font-semibold" htmlFor="fecha">
        Fecha
      </label>
      <input
        id="fecha"
        type="date"
        className="border p-2 mb-4 w-full rounded"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <label className="block mb-2 font-semibold" htmlFor="importe">
        Importe (€)
      </label>
      <input
        id="importe"
        type="number"
        className="border p-2 mb-4 w-full rounded"
        value={importe}
        onChange={(e) => setImporte(Number(e.target.value))}
      />

      <label className="block mb-2 font-semibold" htmlFor="habiaCambio">
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
          <label className="block mb-2 font-semibold" htmlFor="cambioInicial">
            Cambio inicial (€)
          </label>
          <input
            id="cambioInicial"
            type="number"
            className="border p-2 mb-4 w-full rounded"
            value={cambioInicial}
            onChange={(e) => setCambioInicial(Number(e.target.value))}
          />
        </>
      )}

      <label className="block mb-2 font-semibold" htmlFor="categoria">
        Categoría
      </label>
      <select
        id="categoria"
        className="border p-2 mb-4 w-full rounded"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      >
        <option value="">Seleccione una categoría</option>
        <option value="Barra">Barra</option>
        <option value="Evento">Evento</option>
        <option value="Otros ingresos">Otros ingresos</option>
      </select>

      <label className="block mb-2 font-semibold" htmlFor="comentario">
        Comentario (opcional)
      </label>
      <textarea
        id="comentario"
        className="border p-2 mb-4 w-full rounded"
        placeholder="Comentario (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />

      <label className="block mb-2 font-semibold" htmlFor="metodoPago">
        Método de Pago
      </label>
      <select
        id="metodoPago"
        className="border p-2 mb-4 w-full rounded"
        value={metodoPago}
        onChange={(e) => setMetodoPago(e.target.value)}
      >
        <option value="Efectivo">Efectivo</option>
        <option value="Bizum">Bizum</option>
        <option value="Tarjeta">Tarjeta</option>
      </select>

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Guardar Ingreso
      </button>
    </main>
  );
}