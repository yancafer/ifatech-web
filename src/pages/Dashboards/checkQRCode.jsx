import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../connections/supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/checkQRCode.css";

const CheckQRCode = () => {
  const [students, setStudents] = useState([]);
  const [matriculas, setMatriculas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAllowedTime, setIsAllowedTime] = useState(false);
  const [verifiedStudents, setVerifiedStudents] = useState([]);
  const [isManualMode, setIsManualMode] = useState(false);
  const matriculasInputRef = useRef(null); // Referência para o input

  // Função para debouncing
  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  const checkAllowedTime = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    const isWeekday = day >= 1 && day <= 5;
    const isMorningAllowed =
      (hour === 9 && minutes >= 0) || (hour === 10 && minutes === 0);
    const isAfternoonAllowed =
      (hour === 15 && minutes >= 0) || (hour === 16 && minutes === 0);

    const allowed =
      isWeekday && (isMorningAllowed || (day <= 3 && isAfternoonAllowed));
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
      setStudents(data || []);
    }
  };

  const loadVerifiedStudents = () => {
    const storedData = localStorage.getItem("verifiedStudents");
    const storedDate = localStorage.getItem("verificationDate");
    const today = new Date().toISOString().slice(0, 10);

    if (storedData && storedDate === today) {
      setVerifiedStudents(JSON.parse(storedData));
    } else {
      localStorage.removeItem("verifiedStudents");
      localStorage.setItem("verificationDate", today);
    }
  };

  const handleQRCodeVerification = async () => {
    const matriculasArray = matriculas
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter((item) => item);

    // Exibir mensagem de erro apenas se o campo estiver vazio e o botão for clicado
    if (matriculasArray.length === 0) {
      toast.error("Por favor, insira pelo menos uma matrícula para verificar.");
      return;
    }

    if (!isAllowedTime && !isManualMode) {
      toast.error(
        "A verificação de lanche só é permitida nos horários autorizados."
      );
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
        toast.error("Erro ao verificar a matrícula. Tente novamente.");
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
        existingData.data_recebimento?.slice(0, 10) ===
        new Date().toISOString().slice(0, 10);

      if (isReceivedToday) {
        toast.info(
          `${existingData.Nome} (${matricula}) já recebeu o lanche hoje.`,
          {
            position: "top-center",
            style: {
              backgroundColor: "red",
              color: "white",
              textAlign: "center",
            },
          }
        );
        continue;
      }

      if (existingData.apt_to_receive_lunch) {
        if (
          !newVerifiedStudents.some(
            (student) => student.Matrícula === matricula
          )
        ) {
          newVerifiedStudents.push({
            Matrícula: matricula,
            Nome: existingData.Nome,
            mensagem: "Recebido com sucesso!",
            data_recebimento: new Date(),
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
        toast.error("Erro: Aluno não está apto para receber o lanche.");
      }
    }

    setVerifiedStudents(newVerifiedStudents);
    localStorage.setItem(
      "verifiedStudents",
      JSON.stringify(newVerifiedStudents)
    );
    setIsLoading(false);

    if (studentsBeingVerified.length > 0) {
      toast.success(
        `Os seguintes alunos estão sendo verificados: ${studentsBeingVerified
          .map(
            (student) =>
              `${student.Nome} (${student.Matrícula}) - Recebimento do lanche confirmado`
          )
          .join(", ")}`
      );
    }

    // Limpa o campo de matrícula após a verificação
    setMatriculas("");
    matriculasInputRef.current.focus(); // Foca no input após a verificação
  };

  const handleMatriculaChange = (value) => {
    setMatriculas(value);
  };

  const toggleManualMode = () => {
    setIsManualMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    checkAllowedTime();
    fetchStudents();
    loadVerifiedStudents();
    matriculasInputRef.current.focus(); // Foca no input ao montar o componente
  }, []);

  // Verifica automaticamente se a matrícula tem pelo menos 10 caracteres
  useEffect(() => {
    if (matriculas.length >= 10) {
      handleQRCodeVerification(); // Chama a função de verificação
    }
  }, [matriculas]);

  return (
    <div className="qr-check-container">
      <ToastContainer />
      <h2 className="title">Verificar Alunos Aprovados para Lanche</h2>
      <div className="verification-controls">
        <div className="verification-left">
          <input
            type="text"
            placeholder="Digite as matrículas separadas por vírgula ou espaço"
            value={matriculas}
            onChange={(e) => handleMatriculaChange(e.target.value)}
            className="matricula-input-field"
            ref={matriculasInputRef} // Adiciona a referência ao input
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
                <th className="table-header">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {verifiedStudents.map((student, index) => (
                <tr key={index}>
                  <td className="table-cell">{student.Nome}</td>
                  <td className="table-cell">{student.Matrícula}</td>
                  <td className="table-cell">{student.mensagem}</td>
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
