import React, { useState, useEffect } from "react";
import { supabase } from "../../connections/supabaseClient";
import "./styles/checkQRCode.css";

const CheckQRCode = () => {
  const [students, setStudents] = useState([]);
  const [matriculas, setMatriculas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAllowedTime, setIsAllowedTime] = useState(false);
  const [verifiedStudents, setVerifiedStudents] = useState([]);
  const [isManualMode, setIsManualMode] = useState(false);

  const checkAllowedTime = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    const isWeekday = day >= 1 && day <= 5;
    const isMorningAllowed =
      (hour === 9 && minutes >= 15) || (hour === 11 && minutes <= 59);
    const isAfternoonAllowed =
      hour === 15 && minutes <= 45 && day >= 1 && day <= 3;
    const allowed = isWeekday && (isMorningAllowed || isAfternoonAllowed);
    setIsAllowedTime(allowed);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("Nome, Matrícula, apt_to_receive_lunch, data_recebimento")
      .order("data_recebimento", { ascending: false });

    if (error) {
      console.error("Erro ao buscar alunos:", error);
    } else {
      setStudents(data);
    }
  };

  const handleQRCodeVerification = async () => {
    const matriculasArray = matriculas
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter((item) => item);

    if (!matriculasArray.length) {
      alert("Por favor, insira pelo menos uma matrícula para verificar.");
      return;
    }

    if (!isAllowedTime && !isManualMode) {
      alert("A verificação de lanche só é permitida nos horários autorizados.");
      return;
    }

    setIsLoading(true);

    let newVerifiedStudents = [...verifiedStudents];
    let studentsBeingVerified = [];

    for (const matricula of matriculasArray) {
      const { data: existingData, error: existingError } = await supabase
        .from("students")
        .select("data_recebimento, apt_to_receive_lunch, Nome, Matrícula")
        .eq("Matrícula", matricula)
        .single();

      if (existingError) {
        console.error("Erro ao verificar matrícula:", existingError);
        alert("Erro ao verificar a matrícula. Tente novamente.");
        setIsLoading(false);
        return;
      }

      if (!existingData) {
        newVerifiedStudents.push({
          Matrícula: matricula,
          Nome: "Aluno não encontrado",
          mensagem: "Aluno não encontrado",
        });
        continue;
      }

      const isReceivedToday =
        existingData.data_recebimento &&
        existingData.data_recebimento.slice(0, 10) ===
          new Date().toISOString().slice(0, 10);

      if (isReceivedToday) {
        newVerifiedStudents.push({
          Matrícula: matricula,
          Nome: existingData.Nome,
          mensagem: "Já recebeu o lanche hoje",
        });
        continue;
      }

      const aptToReceive = existingData.apt_to_receive_lunch;

      if (aptToReceive === true) {
        if (
          !newVerifiedStudents.some(
            (student) => student.Matrícula === matricula
          )
        ) {
          newVerifiedStudents.push({
            Matrícula: matricula,
            Nome: existingData.Nome,
            mensagem: "Recebido com sucesso!",
          });
          studentsBeingVerified.push(existingData);

          await supabase
            .from("students")
            .update({ data_recebimento: new Date().toISOString() })
            .eq("Matrícula", matricula);
        }
      } else {
        newVerifiedStudents.push({
          Matrícula: existingData.Matrícula,
          Nome: existingData.Nome,
          mensagem: "Erro: Aluno não está apto para receber o lanche",
        });
      }
    }

    setVerifiedStudents(newVerifiedStudents);
    localStorage.setItem(
      "verifiedStudents",
      JSON.stringify(newVerifiedStudents)
    );
    setIsLoading(false);

    if (studentsBeingVerified.length > 0) {
      alert(
        `Os seguintes alunos estão sendo verificados: ${studentsBeingVerified
          .map(
            (student) =>
              `${student.Nome} (${student.Matrícula}) - Recebimento do lanche confirmado`
          )
          .join(", ")}`
      );
    }
  };

  const toggleManualMode = () => {
    setIsManualMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    checkAllowedTime();
    fetchStudents();

    const storedVerifiedStudents = localStorage.getItem("verifiedStudents");
    if (storedVerifiedStudents) {
      setVerifiedStudents(JSON.parse(storedVerifiedStudents));
    }
  }, []);

  return (
    <div className="qr-check-container">
      <h2 className="title">Verificar Alunos Aprovados para Lanche</h2>

      <div className="verification-controls">
        <div className="verification-left">
          <input
            type="text"
            placeholder="Digite as matrículas separadas por vírgula ou espaço"
            value={matriculas}
            onChange={(e) => setMatriculas(e.target.value)}
            className="matricula-input-field"
          />
          <button
            className="verify-button"
            onClick={handleQRCodeVerification}
            disabled={!isAllowedTime && !isManualMode}
            style={{
              backgroundColor:
                !isAllowedTime && !isManualMode ? "#7f8c8d" : "#344e41",
            }}
          >
            {isLoading ? "Verificando..." : "Verificar"}
          </button>
        </div>

        <div className="verification-right">
          <button className="manual-toggle-button" onClick={toggleManualMode}>
            {isManualMode
              ? "Desativar Verificação Manual"
              : "Ativar Verificação Manual"}
          </button>
          {isManualMode && (
            <p className="manual-mode-info">
              Verificação manual ativada. Qualquer horário é permitido.
            </p>
          )}
        </div>
      </div>

      <div className="verified-students-table">
        <h3 className="table-title">Alunos Verificados</h3>
        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th className="table-header">Nome</th>
                <th className="table-header">Matrícula</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {verifiedStudents.map((student, index) => (
                <tr key={index} className="table-row">
                  <td className="table-data">{student.Nome}</td>
                  <td className="table-data">{student.Matrícula}</td>
                  <td className="table-data">{student.mensagem || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckQRCode;
