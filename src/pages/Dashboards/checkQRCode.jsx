import React, { useState, useEffect } from "react";
import { supabase } from "../../connections/supabaseClient"; // Ajuste o caminho conforme necessário

const CheckQRCode = () => {
  const [students, setStudents] = useState([]); // Armazena todos os alunos
  const [matriculas, setMatriculas] = useState(""); // Inicializa o campo de matrícula como uma string vazia
  const [isLoading, setIsLoading] = useState(false); // Para controlar o estado de carregamento
  const [isAllowedTime, setIsAllowedTime] = useState(false); // Para controlar se o horário é permitido
  const [verifiedStudents, setVerifiedStudents] = useState([]); // Armazena todos os alunos verificados

  // Função para verificar se o horário atual está dentro das faixas permitidas (09:15-10:00 ou 15:00-15:45)
  const checkAllowedTime = () => {
    const now = new Date();
    const day = now.getDay(); // Domingo = 0, Segunda = 1, etc.
    const hour = now.getHours();
    const minutes = now.getMinutes();

    // Verifica se é segunda a sexta
    const isWeekday = day >= 1 && day <= 5;

    // Verifica horário permitido da manhã (09:15 até 10:00)
    const isMorningAllowed =
      (hour === 9 && minutes >= 15) || (hour === 11 && minutes <= 59);

    // Verifica horário permitido da tarde (15:00 até 15:45) na segunda, terça e quarta
    const isAfternoonAllowed =
      hour === 15 && minutes <= 45 && day >= 1 && day <= 3;

    // Verifica se está dentro do período de tempo permitido
    const allowed = isWeekday && (isMorningAllowed || isAfternoonAllowed);
    setIsAllowedTime(allowed);
  };

  // Função para buscar todos os alunos do banco de dados
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

  // Função para verificar QR Code e atualizar o status de recebimento do lanche
  const handleQRCodeVerification = async () => {
    const matriculasArray = matriculas
      .split(/[,\s]+/) // Divide o texto em um array com vírgulas ou espaços como separadores
      .map((item) => item.trim()) // Remove espaços em branco extras
      .filter((item) => item); // Remove entradas vazias

    if (!matriculasArray.length) {
      alert("Por favor, insira pelo menos uma matrícula para verificar.");
      return;
    }

    if (!isAllowedTime) {
      alert("A verificação de lanche só é permitida nos horários autorizados.");
      return;
    }

    setIsLoading(true);

    // Acumuladores para armazenar alunos verificados
    let newVerifiedStudents = [...verifiedStudents];
    let studentsBeingVerified = []; // Alunos que estão sendo verificados no momento

    // Loop para verificar matrícula por matrícula
    for (const matricula of matriculasArray) {
      const { data: existingData, error: existingError } = await supabase
        .from("students")
        .select("data_recebimento, apt_to_receive_lunch, Nome, Matrícula")
        .eq("Matrícula", matricula)
        .single(); // Busca aluno com matrícula exata

      if (existingError) {
        console.error("Erro ao verificar matrícula:", existingError);
        alert("Erro ao verificar a matrícula. Tente novamente.");
        setIsLoading(false);
        return;
      }

      if (!existingData) {
        // Adiciona aluno não encontrado na lista de verificados com status "não encontrado"
        newVerifiedStudents.push({
          Matrícula: matricula,
          Nome: "Aluno não encontrado",
          mensagem: "Aluno não encontrado",
        });
        continue;
      }

      // Verifica se o aluno já recebeu o lanche hoje
      const isReceivedToday =
        existingData.data_recebimento &&
        existingData.data_recebimento.slice(0, 10) ===
          new Date().toISOString().slice(0, 10);

      if (isReceivedToday) {
        // Aluno já foi verificado no mesmo dia, então não está apto
        newVerifiedStudents.push({
          Matrícula: matricula,
          Nome: existingData.Nome,
          mensagem: "Já recebeu o lanche hoje",
        });
        continue; // Pula para o próximo aluno
      }

      // Verifica se o aluno está apto
      const aptToReceive = existingData.apt_to_receive_lunch;

      if (aptToReceive === true) {
        // Verifica se o aluno já está na lista de verificados
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
          studentsBeingVerified.push(existingData); // Adiciona o aluno que está sendo verificado
          // Atualiza o campo de data_recebimento com a data atual
          await supabase
            .from("students")
            .update({ data_recebimento: new Date().toISOString() })
            .eq("Matrícula", matricula);
        }
      } else {
        // Se não estiver apto, adiciona à lista de verificados
        newVerifiedStudents.push({
          Matrícula: matricula,
          Nome: existingData.Nome,
          mensagem: "Não está apto para receber o lanche",
        });
      }
    }

    // Atualiza o estado com os novos alunos verificados
    setVerifiedStudents(newVerifiedStudents);

    // Salva os alunos verificados no localStorage para persistência
    localStorage.setItem(
      "verifiedStudents",
      JSON.stringify(newVerifiedStudents)
    );

    setIsLoading(false);

    // Exibe mensagem final apenas com os alunos que estão sendo verificados no momento
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

  // Efeito para verificar se o horário está permitido e carregar os dados da verificação ao iniciar
  useEffect(() => {
    checkAllowedTime(); // Verifica se o horário está permitido
    fetchStudents(); // Busca os alunos

    // Recupera a lista de alunos verificados do localStorage, se existir
    const storedVerifiedStudents = localStorage.getItem("verifiedStudents");
    if (storedVerifiedStudents) {
      setVerifiedStudents(JSON.parse(storedVerifiedStudents));
    }
  }, []);

  return (
    <div>
      <h2>Verificar Alunos Aprovados para Lanche</h2>

      {/* Campo para digitar múltiplas matrículas */}
      <div>
        <input
          type="text"
          placeholder="Digite as matrículas separadas por vírgula ou espaço"
          value={matriculas} // Controla o valor por meio do estado
          onChange={(e) => setMatriculas(e.target.value)} // Atualiza o estado ao digitar
          style={{ marginRight: "10px" }}
        />
        <button
          onClick={handleQRCodeVerification}
          disabled={isLoading || !isAllowedTime} // O botão só é ativado quando permitido
        >
          {isLoading ? "Verificando..." : "Verificar"}
        </button>
      </div>

      {/* Exibe o resultado dos alunos */}
      <div>
        {/* Tabela de Alunos Verificados (Apto ou Não Aptos) */}
        <div style={{ flex: 1 }}>
          <h3>Alunos Verificados</h3>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Matrícula</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {verifiedStudents.map((student, index) => (
                <tr key={index}>
                  <td>{student.Nome}</td>
                  <td>{student.Matrícula}</td>
                  <td>{student.mensagem || "N/A"}</td>
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
