import React, { useState } from "react";
import { supabase } from "../../connections/supabaseClient";
import * as XLSX from "xlsx"; // Importar a biblioteca XLSX

const RegisterStudents = () => {
  const [nome, setNome] = useState("");
  const [curso, setCurso] = useState("");
  const [serie, setSerie] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [file, setFile] = useState(null);

  // Função para inserir o estudante no Supabase
  const handleUpload = async (e) => {
    e.preventDefault();

    try {
      // Inserção de estudante no Supabase
      const { data, error } = await supabase.from("students").insert([
        {
          Nome: nome,
          Curso: curso,
          Série: serie,
          Telefone: telefone,
          Email: email,
          Matrícula: matricula,
        },
      ]);

      if (error) {
        throw error;
      }

      console.log("Estudante cadastrado com sucesso:", data);
      alert("Estudante cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar estudante:", error.message);
      alert(`Erro: ${error.message}`);
    }
  };

  // Função para processar o arquivo XLSX
  const processFile = async (file) => {
    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Para cada aluno na planilha, chamamos o handleUploadCSV para inseri-lo no banco
        for (const student of worksheet) {
          handleUploadCSV(student);
        }
      };

      reader.readAsArrayBuffer(file); // Lê o arquivo XLSX como array buffer

      alert("Planilha processada com sucesso!");
    } catch (error) {
      console.error("Erro ao processar a planilha:", error.message);
    }
  };

  // Função para inserir estudantes do XLSX no Supabase
  const handleUploadCSV = async (student) => {
    try {
      const { data, error } = await supabase.from("students").insert([
        {
          Nome: student.Nome,
          Curso: student.Curso,
          Série: student.Série,
          Telefone: student.Telefone,
          Email: student.Email,
          Matrícula: student.Matrícula,
        },
      ]);

      if (error) throw error;
      console.log("Estudante inserido com sucesso:", data);
    } catch (error) {
      console.error("Erro ao inserir estudante do XLSX:", error.message);
    }
  };

  return (
    <div>
      <h2>Cadastrar Estudantes</h2>
      <form onSubmit={handleUpload}>
        <div>
          <label>Nome:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Curso:</label>
          <select
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            required
          >
            <option value="">Selecione o curso</option>
            <option value="Biotecnologia">Biotecnologia</option>
            <option value="Alimentos">Alimentos</option>
            <option value="Agropecuária">Agropecuária</option>
          </select>
        </div>
        <div>
          <label>Série:</label>
          <input
            type="text"
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Telefone:</label>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Matrícula:</label>
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
          />
        </div>
        <button type="submit">Cadastrar Estudante</button>
      </form>

      <h3>Ou faça upload de uma planilha XLSX</h3>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={() => processFile(file)}>Processar Planilha</button>
    </div>
  );
};

export default RegisterStudents;
