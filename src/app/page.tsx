"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCajaStore } from "@/store/cajaStore";
import { ingresosMock, gastosMock } from "@/data/mockData";
import { v4 as uuidv4 } from "uuid";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

// MovimientosRecientes component moved out of the Home component function
type Movimiento = {
  id?: string;
  fecha: string;
  importe: number;
  tipo: "ingreso" | "gasto";
  descripcion: string;
};
type MovimientosRecientesProps = {
  movimientos: Movimiento[];
  totalDeudas: number;
};
function MovimientosRecientes({ movimientos, totalDeudas }: MovimientosRecientesProps) {
  const [showAllMovimientos, setShowAllMovimientos] = React.useState(false);
  function formatFecha(fecha: string): string {
    const d = new Date(fecha);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}`;
  }
  return (
    <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 flex flex-col">
      <div className="flex items-center mb-4">
        <h2
          className="text-lg font-semibold text-gray-900 mr-2 cursor-pointer select-none"
          onClick={() => setShowAllMovimientos((prev) => !prev)}
          title="Mostrar/ocultar todos los movimientos"
          style={{ userSelect: "none" }}
        >
          {`Movimientos recientes`}
          <span className="ml-2 text-xs align-middle">
            {showAllMovimientos ? "▲" : "▼"}
          </span>
        </h2>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
          {`Deudas: ${totalDeudas.toFixed(2)}`}
        </span>
      </div>
      <ul className="min-w-0">
        {(showAllMovimientos ? movimientos : movimientos.slice(0, 5)).map((m, i) => (
          <li
            key={m.id || i}
            className="flex justify-between items-center border-b last:border-b-0 py-2"
          >
            <span className="text-base sm:text-lg text-gray-800">
              {m.descripcion}{" "}
              <span className="text-gray-500 text-sm">({formatFecha(m.fecha)})</span>
            </span>
            <span
              className={
                m.tipo === "ingreso"
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {m.importe.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const ingresos = useCajaStore((state) => state.ingresos);
  const gastos = useCajaStore((state) => state.gastos);
  const addIngreso = useCajaStore((state) => state.addIngreso);
  const addGasto = useCajaStore((state) => state.addGasto);

  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [appliedFechaInicio, setAppliedFechaInicio] = useState<string>("");
  const [appliedFechaFin, setAppliedFechaFin] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<"semana" | "mes" | "personalizado">("semana");

  const filteredIngresos = React.useMemo(() => {
    if (!appliedFechaInicio) return ingresos;
    const start = appliedFechaInicio;
    const end = appliedFechaFin || appliedFechaInicio;
    return ingresos.filter((ingreso) => ingreso.fecha >= start && ingreso.fecha <= end);
  }, [ingresos, appliedFechaInicio, appliedFechaFin]);

  const filteredGastos = React.useMemo(() => {
    if (!appliedFechaInicio) return gastos;
    const start = appliedFechaInicio;
    const end = appliedFechaFin || appliedFechaInicio;
    return gastos.filter((gasto) => gasto.fecha >= start && gasto.fecha <= end);
  }, [gastos, appliedFechaInicio, appliedFechaFin]);

  const totalIngresos = filteredIngresos.reduce((acc, ingreso) => {
    if (ingreso.habiaCambio) {
      return acc + ingreso.importe - (ingreso.cambioInicial || 0);
    }
    return acc + ingreso.importe;
  }, 0);

  const totalGastos = filteredGastos.reduce((acc, gasto) => acc + gasto.importe, 0);
  const beneficio = totalIngresos - totalGastos;

  // Prepare data array combining ingresos and gastos by fecha
  const fechasSet = new Set<string>();
  filteredIngresos.forEach((ingreso) => fechasSet.add(ingreso.fecha));
  filteredGastos.forEach((gasto) => fechasSet.add(gasto.fecha));
  const fechas = Array.from(fechasSet).sort();

  const data = fechas.map((fecha) => {
    const ingresoSum = filteredIngresos
      .filter((ingreso) => ingreso.fecha === fecha)
      .reduce((acc, ingreso) => {
        if (ingreso.habiaCambio) {
          return acc + ingreso.importe - (ingreso.cambioInicial || 0);
        }
        return acc + ingreso.importe;
      }, 0);
    const gastoSum = filteredGastos
      .filter((gasto) => gasto.fecha === fecha && !gasto.pagado)
      .reduce((acc, gasto) => acc + gasto.importe, 0);
    return {
      fecha,
      ingresos: ingresoSum,
      gastos: gastoSum,
    };
  });

  useEffect(() => {
    if (ingresos.length === 0 && gastos.length === 0) {
      ingresosMock.forEach((ingreso) => {
        addIngreso({ id: uuidv4(), ...ingreso });
      });
      gastosMock.forEach((gasto) => {
        addGasto({ id: uuidv4(), ...gasto });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#FF4C4C",
    "#8884d8",
  ];

  // Prepare data for PieChart: gastos grouped by categoria
  const gastosPorCategoriaMap = filteredGastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.importe;
    return acc;
  }, {} as Record<string, number>);
  const gastosPorCategoria = Object.entries(gastosPorCategoriaMap).map(
    ([categoria, importe]) => ({
      categoria,
      importe,
    })
  );

  function formatFecha(fecha: string): string {
    const d = new Date(fecha);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}`;
  }

  // Move visionTab state to top-level of Home component
  const [visionTab, setVisionTab] = React.useState<"evolucion" | "comparativa">("evolucion");

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20 flex flex-col items-center w-full">
      {/* Header */}
      {/* <header className="w-full flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Comisión</h1>
      </header> */}

      {/* Balance Card */}
      <div
        className="w-full rounded-2xl shadow p-8 mt-8 mb-4 text-gray-900 flex flex-col justify-between min-h-[260px] relative"
        style={{ background: 'linear-gradient(to right, #E4FF3C, #D7F12C)' }}
      >
        <div className="flex justify-between items-start w-full mb-4">
          <p className="text-lg sm:text-xl font-semibold">Vuestro balance!</p>
        </div>
        <div className="flex-1 flex flex-row justify-between items-center w-full">
          <span className="text-5xl sm:text-6xl font-extrabold text-left">${beneficio.toFixed(2)}</span>
          <Image
            src="/money-euro-svgrepo-com.svg"
            width={40}
            height={40}
            alt="Menu"
            style={{ marginLeft: "auto" }}
          />
        </div>
        <div className="flex justify-between items-end mt-8 space-x-4 w-full">
          <div className="flex flex-col items-start">
            <span className="text-sm text-gray-600">Profit</span>
            <span className="text-green-700 font-bold text-lg">+{totalIngresos.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-600">Spend</span>
            <span className="text-red-600 font-bold text-lg">-{totalGastos.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full flex justify-center space-x-4 mb-2">
        <button
          onClick={() => {
            setSelectedTab("semana");
            setAppliedFechaInicio("");
            setAppliedFechaFin("");
          }}
          className={`px-3 py-2 rounded-md font-semibold shadow ${
            selectedTab === "semana"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          }`}
        >
          Semana
        </button>
        <button
          onClick={() => {
            setSelectedTab("mes");
            setAppliedFechaInicio("");
            setAppliedFechaFin("");
          }}
          className={`px-3 py-2 rounded-md font-semibold shadow ${
            selectedTab === "mes"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          }`}
        >
          Mes
        </button>
        <button
          onClick={() => {
            setSelectedTab("personalizado");
          }}
          className={`px-3 py-2 rounded-md font-semibold shadow ${
            selectedTab === "personalizado"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          }`}
        >
          Personalizado
        </button>
      </div>
      {selectedTab === "personalizado" && (
        <div className="w-full flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border rounded px-3 py-1"
            placeholder="Fecha inicio"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border rounded px-3 py-1"
            placeholder="Fecha fin"
          />
          <button
            onClick={() => {
              setAppliedFechaInicio(fechaInicio);
              setAppliedFechaFin(fechaFin);
            }}
            className="px-3 py-1 bg-indigo-600 text-white rounded font-semibold"
          >
            Aplicar
          </button>
        </div>
      )}

      {/* --- Visión general - Alternativas --- */}
      {/* Section A: Resumen por periodo (BarChart, dummy aggregated by semana/mes) */}
      <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Visión general - Resumen por periodo
        </h2>
        <div className="w-full h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { periodo: "Semana 1", ingresos: 500, gastos: 350 },
                { periodo: "Semana 2", ingresos: 600, gastos: 400 },
                { periodo: "Semana 3", ingresos: 550, gastos: 300 },
                { periodo: "Semana 4", ingresos: 700, gastos: 500 },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#00C49F" name="Ingresos" />
              <Bar dataKey="gastos" fill="#FF4C4C" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Section C: Gráfico filtrado (mes actual) */}
      <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Visión general - Gráfico filtrado (mes actual)
        </h2>
        <div className="w-full min-w-0" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={
                (() => {
                  // Use filteredIngresos and filteredGastos for current month
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = now.getMonth();
                  function isCurrentMonth(fecha: string) {
                    const d = new Date(fecha);
                    return d.getFullYear() === year && d.getMonth() === month;
                  }
                  const ingresosMes = filteredIngresos.filter((i) => isCurrentMonth(i.fecha));
                  const gastosMes = filteredGastos.filter((g) => isCurrentMonth(g.fecha));
                  const fechasSet = new Set<string>();
                  ingresosMes.forEach((i) => fechasSet.add(i.fecha));
                  gastosMes.forEach((g) => fechasSet.add(g.fecha));
                  const fechas = Array.from(fechasSet).sort();
                  return fechas.map((fecha) => {
                    const ingresoSum = ingresosMes
                      .filter((i) => i.fecha === fecha)
                      .reduce((acc, i) => {
                        if (i.habiaCambio) {
                          return acc + i.importe - (i.cambioInicial || 0);
                        }
                        return acc + i.importe;
                      }, 0);
                    const gastoSum = gastosMes
                      .filter((g) => g.fecha === fecha && !g.pagado)
                      .reduce((acc, g) => acc + g.importe, 0);
                    return {
                      fecha,
                      ingresos: ingresoSum,
                      gastos: gastoSum,
                    };
                  });
                })()
              }
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tickFormatter={formatFecha} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="ingresos" stroke="#00C49F" fill="#E5FFF6" name="Ingresos" />
              <Area type="monotone" dataKey="gastos" stroke="#FF4C4C" fill="#FFE5E5" name="Gastos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* --- Categorías de gasto Card --- */}
      <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Categorías de gasto
        </h2>
        <div className="w-full h-80 sm:h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gastosPorCategoria}
                dataKey="importe"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {gastosPorCategoria.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Total de gastos */}
        <div className="mt-4 flex justify-center">
          <span className="text-base font-semibold text-gray-700">
            Total gastos: {filteredGastos.reduce((acc, gasto) => acc + gasto.importe, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* --- Cosas por pagar Card --- */}
      <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Cosas por pagar
        </h2>
        {(() => {
          const cosasPorPagar = filteredGastos.filter(
            (g) => g.categoria === "Uno de nosotros" && !g.pagado
          );
          if (cosasPorPagar.length === 0) {
            return <div className="text-gray-500">No hay cosas pendientes de pagar.</div>;
          }
          return (
            <ul className="min-w-0">
              {cosasPorPagar.map((g, i) => (
                <li
                  key={g.id || i}
                  className="flex justify-between items-center border-b last:border-b-0 py-2"
                >
                  <span className="text-base text-gray-800">
                    {g.descripcion || g.nombrePersona || "Sin descripción"}
                    <span className="text-gray-500 text-sm ml-2">({formatFecha(g.fecha)})</span>
                  </span>
                  <span className="text-red-600 font-bold">{g.importe.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          );
        })()}
      </div>

      {/* --- Movimientos recientes Card --- */}
      {(() => {
        // Calculate total deudas for badge
        const deudas = filteredGastos.filter(
          (g) => g.categoria === "Uno de nosotros" && !g.pagado
        );
        const totalDeudas = deudas.reduce((acc, g) => acc + g.importe, 0);
        // Combine ingresos and gastos, add type
        const movimientos = [
          ...filteredIngresos.map((i) => ({
            ...i,
            tipo: "ingreso" as const,
            fecha: i.fecha,
            importe: i.habiaCambio
              ? i.importe - (i.cambioInicial || 0)
              : i.importe,
            descripcion: "Ingreso",
          })),
          ...filteredGastos.map((g) => ({
            ...g,
            tipo: "gasto" as const,
            fecha: g.fecha,
            importe: g.importe,
            descripcion: g.descripcion || g.categoria || "Gasto",
          })),
        ];
        movimientos.sort((a, b) => {
          // Sort by fecha desc, fallback to id
          if (a.fecha > b.fecha) return -1;
          if (a.fecha < b.fecha) return 1;
          return 0;
        });
        return (
          <MovimientosRecientes
            movimientos={movimientos}
            totalDeudas={totalDeudas}
          />
        );

      })()}
    </div>   
  );         
}           