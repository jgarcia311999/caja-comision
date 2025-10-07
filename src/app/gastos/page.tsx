"use client";

import { useState } from "react";
import { useCajaStore } from "@/store/cajaStore";
import { v4 as uuidv4 } from "uuid";

export default function GastosPage() {
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [importe, setImporte] = useState(0);
  const [metodoPago, setMetodoPago] = useState("");
  const [unoDeNosotros, setUnoDeNosotros] = useState(false);
  const [nombrePersona, setNombrePersona] = useState("");

  const addGasto = useCajaStore((state) => state.addGasto);

  const handleSave = () => {
    const gasto = {
      id: uuidv4(),
      fecha,
      categoria,
      descripcion,
      importe,
      metodoPago,
      estado: "PENDIENTE" as const,
      ...(unoDeNosotros && { nombrePersona }),
    };
    addGasto(gasto);
    setFecha(new Date().toISOString().split("T")[0]);
    setCategoria("");
    setDescripcion("");
    setImporte(0);
    setMetodoPago("");
    setUnoDeNosotros(false);
    setNombrePersona("");
    alert("Gasto registrado ✅");
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategoria(value);
    if (value === "Uno de nosotros") {
      setUnoDeNosotros(true);
    } else {
      setUnoDeNosotros(false);
      setNombrePersona("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20 flex flex-col items-center w-full">
      <main className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-4">Registrar Gasto</h1>

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="fecha">Fecha</label>
        <input
          id="fecha"
          type="date"
          className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="categoria">Categoría</label>
        <select
          id="categoria"
          className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={categoria}
          onChange={handleCategoriaChange}
        >
          <option value="" disabled>
            Selecciona categoría
          </option>
          <option value="Proveedores">Proveedores</option>
          <option value="Hielo">Hielo</option>
          <option value="Limpieza">Limpieza</option>
          <option value="Licencias">Licencias</option>
          <option value="Otros">Otros</option>
          <option value="Uno de nosotros">Uno de nosotros</option>
        </select>

        {unoDeNosotros && (
          <>
            <label className="block mb-2 font-semibold text-gray-900" htmlFor="nombrePersona">Nombre (si es uno de nosotros)</label>
            <input
              id="nombrePersona"
              className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="Nombre"
              value={nombrePersona}
              onChange={(e) => setNombrePersona(e.target.value)}
            />
          </>
        )}

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="descripcion">Descripción</label>
        <input
          id="descripcion"
          className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="importe">Importe (€)</label>
        <input
          id="importe"
          type="number"
          className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          placeholder="Importe (€)"
          value={importe}
          onChange={(e) => setImporte(Number(e.target.value))}
        />

        <label className="block mb-2 font-semibold text-gray-900" htmlFor="metodoPago">Método de pago</label>
        <select
          id="metodoPago"
          className="border border-gray-300 rounded-2xl p-2 mb-4 w-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="" disabled>
            Selecciona método de pago
          </option>
          <option value="Efectivo">Efectivo</option>
          <option value="Bizum">Bizum</option>
          <option value="Tarjeta">Tarjeta</option>
        </select>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Guardar Gasto
        </button>
      </main>
    </div>
  );
}