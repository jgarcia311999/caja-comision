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
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Registrar Gasto</h1>

      <label className="block mb-1 font-medium" htmlFor="fecha">Fecha</label>
      <input
        id="fecha"
        type="date"
        className="border p-2 mb-2 w-full rounded"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <label className="block mb-1 font-medium" htmlFor="categoria">Categoría</label>
      <select
        id="categoria"
        className="border p-2 mb-2 w-full rounded"
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
          <label className="block mb-1 font-medium" htmlFor="nombrePersona">Nombre (si es uno de nosotros)</label>
          <input
            id="nombrePersona"
            className="border p-2 mb-2 w-full rounded"
            placeholder="Nombre"
            value={nombrePersona}
            onChange={(e) => setNombrePersona(e.target.value)}
          />
        </>
      )}

      <label className="block mb-1 font-medium" htmlFor="descripcion">Descripción</label>
      <input
        id="descripcion"
        className="border p-2 mb-2 w-full rounded"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <label className="block mb-1 font-medium" htmlFor="importe">Importe (€)</label>
      <input
        id="importe"
        type="number"
        className="border p-2 mb-2 w-full rounded"
        placeholder="Importe (€)"
        value={importe}
        onChange={(e) => setImporte(Number(e.target.value))}
      />

      <label className="block mb-1 font-medium" htmlFor="metodoPago">Método de pago</label>
      <select
        id="metodoPago"
        className="border p-2 mb-2 w-full rounded"
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
        className="bg-red-600 text-white px-4 py-2 rounded w-full"
      >
        Guardar Gasto
      </button>
    </main>
  );
}