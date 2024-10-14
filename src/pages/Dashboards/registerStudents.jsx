import React, { useState } from "react";
import { supabase } from "../../connections/supabaseClient"; // Importar a instância única do Supabase

const RegisterStudents = () => {
  const [nome, setNome] = useState("");
  const [serie, setSerie] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [file, setFile] = useState(null);

  // Função para inserir o estudante no Supabase
  const handleUpload = async (e) => {
    e.preventDefault();

    try {
      // Inserção de estudante no Supabase (sem o campo 'Curso')
      const { data, error } = await supabase.from("students").insert([
        {
          Nome: nome,
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

  // Função para processar o arquivo CSV
  const processFile = async (file) => {
    try {
      const text = await file.text();
      const students = CSVToJSON(text); // Função para converter CSV para JSON

      // Para cada aluno na planilha, chamamos o handleUploadCSV para inseri-lo no banco
      for (const student of students) {
        await handleUploadCSV(student);
      }

      alert("Planilha processada com sucesso!");
    } catch (error) {
      console.error("Erro ao processar a planilha:", error.message);
    }
  };

  // Função para inserir estudantes do CSV no Supabase
  const handleUploadCSV = async (student) => {
    try {
      const { data, error } = await supabase.from("students").insert([
        {
          Nome: student.Nome,
          Série: student.Série,
          Telefone: student.Telefone,
          Email: student.Email,
          Matrícula: student.Matrícula,
        },
      ]);

      if (error) throw error;
      console.log("Estudante inserido com sucesso:", data);
    } catch (error) {
      console.error("Erro ao inserir estudante do CSV:", error.message);
    }
  };

  // Função para converter CSV em JSON
  const CSVToJSON = (csv) => {
    const lines = csv.split("\n");
    const headers = lines[0].split(",");

    const result = lines.slice(1).map((line) => {
      const values = line.split(",");
      let obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index].trim();
      });
      return obj;
    });

    return result;
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

      <h3>Ou faça upload de uma planilha CSV</h3>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={() => processFile(file)}>Processar Planilha</button>
    </div>
  );
};

export default RegisterStudents;
