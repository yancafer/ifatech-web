import React, { useState, useEffect } from "react";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Importando o plugin
import { supabase } from "../../connections/supabaseClient";
import { Bar } from "react-chartjs-2";
import "./styles/report.css";

Chart.register(...registerables);
Chart.register(ChartDataLabels); 

function Report() {
  const [dailyData, setDailyData] = useState({ verified: 0, notVerified: 0 });
  const [weeklyData, setWeeklyData] = useState({ verified: 0, notVerified: 0 });
  const [monthlyData, setMonthlyData] = useState({
    verified: 0,
    notVerified: 0,
  });
  const [yearlyData, setYearlyData] = useState({ verified: 0, notVerified: 0 });

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const fetchVerificationData = async () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoISOString = oneYearAgo.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("students")
      .select("data_recebimento")
      .gte("data_recebimento", oneYearAgoISOString);

    if (error) {
      console.error("Erro ao buscar dados de verificação:", error);
      return;
    }

    const today = new Date();
    const todayISOString = today.toISOString().split("T")[0];

    // Filtrar verificados e não verificados
    const verified = data.filter(
      (student) =>
        student.data_recebimento !== null && student.data_recebimento !== ""
    );
    const notVerified = data.filter(
      (student) =>
        student.data_recebimento === null || student.data_recebimento === ""
    );

    // Daily Data
    const verifiedToday = verified.filter((student) => {
      const studentDate = new Date(student.data_recebimento);
      const isToday =
        studentDate.toISOString().split("T")[0] === todayISOString;
      return isToday;
    });

    const notVerifiedToday = notVerified.filter((student) => {
      const studentDate = new Date(student.data_recebimento);
      const isToday =
        studentDate.toISOString().split("T")[0] === todayISOString;
      return isToday;
    }).length;

    setDailyData({
      verified: verifiedToday.length
    });

    // Weekly Data
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const verifiedThisWeek = verified.filter(
      (student) => new Date(student.data_recebimento) >= oneWeekAgo
    );

    setWeeklyData({
      verified: verifiedThisWeek.length
    });

    // Monthly Data
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const verifiedThisMonth = verified.filter(
      (student) => new Date(student.data_recebimento) >= oneMonthAgo
    );

    setMonthlyData({
      verified: verifiedThisMonth.length,
    });

    // Yearly Data
    const verifiedThisYear = verified.filter(
      (student) => new Date(student.data_recebimento) >= oneYearAgo
    );

    setYearlyData({
      verified: verifiedThisYear.length,
    });
  };

  const chartData = {
    labels: ["Verificados"],
    datasets: [
      {
        label: "Hoje",
        data: [dailyData.verified],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Esta Semana",
        data: [weeklyData.verified],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
      {
        label: "Este Mês",
        data: [monthlyData.verified],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
      {
        label: "Este Ano",
        data: [yearlyData.verified],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    layout: {
      padding: {
        top: 40, // Aumentar o espaço entre a legenda e o gráfico
      },
    },
    plugins: {
      legend: {
        position: "bottom", // Mudando a posição da legenda para baixo
      },
      datalabels: {
        color: "black", // Cor do texto
        anchor: "end", // Posição do texto
        align: "start", // Alinhamento do texto para cima
        formatter: (value) => value, // Formato do valor
      },
    },
  };

  return (
    <div className="chart-container">
      <h1 className="report-title">Relatório de Verificação de QR Code</h1>
      <div className="chart">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default Report;
