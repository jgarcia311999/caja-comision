/* eslint-disable @typescript-eslint/no-var-requires */
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCajaStore } from "@/store/cajaStore";
import type { Gasto } from "@/store/cajaStore";
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Treemap,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
    // Excluir el cambio inicial y los ingresos no confirmados
    if (!ingreso.confirmado) return acc;
    if (ingreso.comentario?.toLowerCase().includes("cambio inicial")) {
      return acc - ingreso.importe;
    }
    return acc + ingreso.importe;
  }, 0);

  const totalIngresosConPrevistos = filteredIngresos.reduce((acc, ingreso) => {
    if (ingreso.comentario?.toLowerCase().includes("cambio inicial")) {
      return acc - ingreso.importe;
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
        if (!ingreso.confirmado) return acc;
        if (ingreso.comentario?.toLowerCase().includes("cambio inicial")) {
          return acc - ingreso.importe;
        }
        return acc + ingreso.importe;
      }, 0);
    const gastoSum = filteredGastos
      .filter((gasto) => gasto.fecha === fecha && gasto.estado === "PENDIENTE")
      .reduce((acc, gasto) => acc + gasto.importe, 0);
    return {
      fecha,
      ingresos: ingresoSum,
      gastos: gastoSum,
    };
  });

  useEffect(() => {
    // Evitar duplicados: si ya existe persistencia, no sembrar mocks
    if (typeof window !== "undefined" && localStorage.getItem("caja-storage")) {
      return;
    }
    if (ingresos.length === 0 && gastos.length === 0) {
      ingresosMock.forEach((ingreso) => {
        addIngreso({ ...ingreso, id: uuidv4() });
      });
      gastosMock.forEach((gasto: Gasto) => {
        addGasto({ ...gasto, id: uuidv4(), estado: gasto.estado ?? "PENDIENTE" });
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
  const totalGastosCategorias = gastosPorCategoria.reduce((acc, it) => acc + it.importe, 0);

  function formatFecha(fecha: string): string {
    const d = new Date(fecha);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}`;
  }

  // Move visionTab state to top-level of Home component
  const [visionTab, setVisionTab] = React.useState<"evolucion" | "comparativa">("evolucion");

  // Collapsible state for Pago entre nosotros and Cosas por pagar
  const [showAllPagoNosotros, setShowAllPagoNosotros] = useState(false);
  const [showAllCosas, setShowAllCosas] = useState(false);

  // Prepare data for Gasto por persona (Uno de nosotros)
  const gastosUnoDeNosotros = filteredGastos.filter(g => g.categoria === "Uno de nosotros");
  const gastosPorPersonaMap = gastosUnoDeNosotros.reduce((acc, gasto) => {
    const persona = gasto.nombrePersona || "Sin nombre";
    acc[persona] = (acc[persona] || 0) + gasto.importe;
    return acc;
  }, {} as Record<string, number>);
  const gastosPorPersona = Object.entries(gastosPorPersonaMap).map(
    ([persona, importe]) => ({
      persona,
      importe,
    })
  );
  const totalGastoUnoDeNosotros = gastosUnoDeNosotros.reduce((acc, gasto) => acc + gasto.importe, 0);

  // --- Exportar Excel ---
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Ingresos
    const ingresosWS = XLSX.utils.json_to_sheet(ingresos);
    XLSX.utils.book_append_sheet(wb, ingresosWS, "Ingresos");

    // Gastos
    const gastosWS = XLSX.utils.json_to_sheet(gastos);
    XLSX.utils.book_append_sheet(wb, gastosWS, "Gastos");

    // Exportar
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "caja-comision.xlsx");
  };

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
            <span className="text-xs text-gray-500">
              Incl. previstos: +{totalIngresosConPrevistos.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-600">Spend</span>
            <span className="text-red-600 font-bold text-lg">-{totalGastos.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-end mb-6">
        <button
          onClick={handleExportExcel}
          className="w-12 h-12 flex items-center justify-center bg-green-600 text-white rounded-full shadow hover:bg-green-700"
          title="Descargar Excel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>



      {/* --- Categorías de gasto Card --- */}
      <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Categorías de gasto
        </h2>
        <div className="w-full h-56 sm:h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gastosPorCategoria}
                dataKey="importe"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={110}
                labelLine={false}
                label={false}
              >
                {gastosPorCategoria.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-4 divide-y">
          {gastosPorCategoria
            .slice()
            .sort((a, b) => b.importe - a.importe)
            .map((item, idx) => (
              <li key={item.categoria} className="flex justify-between items-center py-2">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-gray-800">{item.categoria}</span>
                </span>
                <span className="text-gray-900 font-semibold">
                  {item.importe.toFixed(2)}
                  <span className="ml-2 text-xs text-gray-500">
                    ({totalGastosCategorias > 0 ? ((item.importe / totalGastosCategorias) * 100).toFixed(0) : 0}%)
                  </span>
                </span>
              </li>
            ))}
        </ul>
        {/* Total de gastos */}
        <div className="mt-4 flex justify-center">
          <span className="text-base font-semibold text-gray-700">
            Total gastos: {filteredGastos.reduce((acc, gasto) => acc + gasto.importe, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* --- Gasto por persona (Uno de nosotros) Card --- */}
      {/* Collapsible: Pago entre nosotros */}
      {
        (() => {
          // Sort: estado PENDIENTE first, then fecha desc
          const sortedGastos = gastosUnoDeNosotros
            .slice()
            .sort((a, b) => {
              if (a.estado === "PENDIENTE" && b.estado === "PAGADO") return -1;
              if (a.estado === "PAGADO" && b.estado === "PENDIENTE") return 1;
              if (a.fecha > b.fecha) return -1;
              if (a.fecha < b.fecha) return 1;
              return 0;
            });
          const visibleGastos = showAllPagoNosotros ? sortedGastos : sortedGastos.slice(0, 5);
          return (
            <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pago entre nosotros
              </h2>
              <div className="w-full flex justify-center">
                <ul className="w-full">
                  {visibleGastos.map((g, i) => (
                    <li
                      key={g.id || i}
                      className="flex justify-between items-center border-b last:border-b-0 py-2"
                    >
                      <span className="text-base text-gray-800">{g.nombrePersona || "Sin nombre"}</span>
                      <span
                        className={`font-bold ${g.estado === "PENDIENTE" ? "text-red-600" : "text-gray-500 line-through"}`}
                      >
                        {g.importe.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Toggle button if more than 5 */}
              {sortedGastos.length > 5 && (
                <button
                  onClick={() => setShowAllPagoNosotros((prev) => !prev)}
                  className="text-xs text-blue-600 mt-2"
                >
                  {showAllPagoNosotros ? "Ver menos" : "Ver más"}
                </button>
              )}
              {/* Total gasto Uno de nosotros */}
              <div className="mt-4 flex justify-center">
                <span className="text-base font-semibold text-gray-700">
                  Total gasto: {totalGastoUnoDeNosotros.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })()
      }

      {/* --- Cosas por pagar Card --- */}
      {
        (() => {
          let cosasPorPagar = filteredGastos.filter(
            (g) => g.categoria === "Uno de nosotros" && g.estado === "PENDIENTE"
          );
          // Sort cosasPorPagar by fecha descending
          cosasPorPagar = cosasPorPagar.slice().sort((a, b) => {
            if (a.fecha > b.fecha) return -1;
            if (a.fecha < b.fecha) return 1;
            return 0;
          });
          const visibleCosas = showAllCosas ? cosasPorPagar : cosasPorPagar.slice(0, 5);
          return (
            <div className="w-full bg-white rounded-2xl shadow p-6 mb-6 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Cosas por pagar
              </h2>
              {cosasPorPagar.length === 0 ? (
                <div className="text-gray-500">No hay cosas pendientes de pagar.</div>
              ) : (
                <>
                  <ul className="min-w-0">
                    {visibleCosas.map((g, i) => (
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
                  {cosasPorPagar.length > 5 && (
                    <button
                      onClick={() => setShowAllCosas((prev) => !prev)}
                      className="text-xs text-blue-600 mt-2"
                    >
                      {showAllCosas ? "Ver menos" : "Ver más"}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })()
      }

      {/* --- Movimientos recientes Card --- */}
      {(() => {
        // Calculate total deudas for badge
        const deudas = filteredGastos.filter(
          (g) => g.categoria === "Uno de nosotros" && g.estado === "PENDIENTE"
        );
        const totalDeudas = deudas.reduce((acc, g) => acc + g.importe, 0);
        // Combine ingresos and gastos, add type
        const movimientos = [
          ...filteredIngresos
            .filter((i) => i.confirmado)
            .map((i) => ({
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
        // Ensure movimientos sorted by fecha desc
        movimientos.sort((a, b) => {
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