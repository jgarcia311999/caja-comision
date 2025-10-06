"use client";
import React, { useEffect, useState } from "react";
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
} from "recharts";

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20 flex flex-col items-center w-full">
      {/* Header */}
      {/* <header className="w-full flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Comisión</h1>
      </header> */}

      {/* Balance Card */}
      <div className="w-full rounded-lg shadow p-4 mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex flex-col items-center">
        <p className="text-xl sm:text-lg font-semibold">Balance actual</p>
        <p className="text-6xl sm:text-5xl font-extrabold mt-2">{beneficio.toFixed(2)}</p>
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

      {/* BarChart Card */}
      <div className="w-full bg-white rounded-lg shadow p-4 mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ingresos vs Gastos
        </h2>
        <div className="w-full h-80 sm:h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tickFormatter={formatFecha} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#00C49F" name="Ingresos" />
              <Bar dataKey="gastos" fill="#FF4C4C" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Summary Card */}
      <div className="w-full bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row justify-around text-center space-y-4 sm:space-y-0">
        <div>
          <p className="text-green-600 font-semibold text-base sm:text-lg">Ingresos</p>
          <p className="text-2xl font-bold text-green-700">
            {totalIngresos.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-red-600 font-semibold text-base sm:text-lg">Gastos</p>
          <p className="text-2xl font-bold text-red-700">
            {totalGastos.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-900 font-semibold text-base sm:text-lg">Beneficio</p>
          <p className="text-2xl font-bold text-gray-900">
            {beneficio.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Top Gastos por Categoría */}
      <div className="w-full bg-white rounded-lg shadow p-4 mt-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top Gastos por Categoría
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { cat: "Proveedores", bg: "bg-blue-100", text: "text-blue-800" },
            { cat: "Hielo", bg: "bg-cyan-100", text: "text-cyan-800" },
            { cat: "Limpieza", bg: "bg-green-100", text: "text-green-800" },
            {
              cat: "Uno de nosotros",
              bg: "bg-pink-100",
              text: "text-pink-800",
            },
          ].map(({ cat, bg, text }) => {
            const total = filteredGastos
              .filter((g) => g.categoria === cat)
              .reduce((acc, g) => acc + g.importe, 0);
            return (
              <div
                key={cat}
                className={`${bg} rounded-lg p-4 flex flex-col items-center`}
              >
                <p className={`font-semibold text-base sm:text-lg ${text}`}>{cat}</p>
                <p className={`text-xl sm:text-2xl font-bold mt-2 ${text}`}>
                  {total.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deudas pendientes */}
      <div className="w-full rounded-lg shadow p-4 mb-6 bg-yellow-100 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          Deudas pendientes
        </h2>
        {(() => {
          const deudas = filteredGastos.filter(
            (g) => g.categoria === "Uno de nosotros" && !g.pagado
          );
          const totalDeudas = deudas.reduce((acc, g) => acc + g.importe, 0);
          return (
            <p className="text-3xl font-bold text-yellow-700">
              {totalDeudas.toFixed(2)}
            </p>
          );
        })()}
      </div>

      {/* Movimientos recientes */}
      <div className="w-full bg-white rounded-lg shadow p-4 mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Movimientos recientes
        </h2>
        <ul className="min-w-0">
          {(() => {
            // Combine ingresos and gastos, add type
            const movimientos = [
              ...filteredIngresos.map((i) => ({
                ...i,
                tipo: "ingreso",
                fecha: i.fecha,
                importe: i.habiaCambio
                  ? i.importe - (i.cambioInicial || 0)
                  : i.importe,
                descripcion: "Ingreso",
              })),
              ...filteredGastos.map((g) => ({
                ...g,
                tipo: "gasto",
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
            return movimientos.slice(0, 5).map((m, i) => (
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
            ));
          })()}
        </ul>
      </div>

      {/* Distribución de Gastos por Categoría */}
      <div className="w-full bg-white rounded-lg shadow p-4 mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución de Gastos por Categoría
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
      </div>

      {/* Evolución Ingresos vs Gastos */}
      <div className="w-full bg-white rounded-lg shadow p-4 mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Evolución Ingresos vs Gastos
        </h2>
        <div className="w-full h-80 sm:h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tickFormatter={formatFecha} />
              <YAxis domain={[0, "dataMax + 50"]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#00C49F"
                strokeWidth={2}
                dot={false}
                name="Ingresos"
              />
              <Line
                type="monotone"
                dataKey="gastos"
                stroke="#FF4C4C"
                strokeWidth={2}
                dot={false}
                name="Gastos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
