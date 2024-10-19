import React, { useState } from "react";
import { supabase } from "../../connections/supabaseClient";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import axios from "axios";
import "./styles/registerStudents.css";

const RegisterStudents = () => {
  const [nome, setNome] = useState("");
  const [curso, setCurso] = useState("");
  const [serie, setSerie] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [file, setFile] = useState(null);

  const generateQRCodeAndUpload = async (matricula) => {
    try {
      const matriculaString = String(matricula);
      const qrCodeDataURL = await QRCode.toDataURL(matriculaString);
      const cloudinaryUploadURL = import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;
      const cloudinaryUploadPreset = import.meta.env
        .VITE_CLOUDINARY_UPLOAD_PRESET;
      const formData = new FormData();
      const byteString = atob(qrCodeDataURL.split(",")[1]);
      const mimeString = qrCodeDataURL
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      const qrBlob = new Blob([byteArray], { type: mimeString });

      formData.append("file", qrBlob);
      formData.append("upload_preset", cloudinaryUploadPreset);

      const response = await axios.post(cloudinaryUploadURL, formData);
      return response.data.secure_url;
    } catch (error) {
      console.error("Erro ao gerar ou fazer upload do QR code:", error);
      throw error;
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const qrCodeURL = await generateQRCodeAndUpload(matricula);
      const { data, error } = await supabase.from("students").insert([
        {
          Nome: nome,
          Curso: curso,
          Série: serie,
          Telefone: telefone,
          Email: email,
          Matrícula: matricula,
          qr_code_url: qrCodeURL,
        },
      ]);
      if (error) {
        throw error;
      }
      alert("Estudante cadastrado com sucesso!");
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  };

  const processFile = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        for (const student of worksheet) {
          handleUploadCSV(student);
        }
      };
      reader.readAsArrayBuffer(file);
      alert("Planilha processada com sucesso!");
    } catch (error) {
      console.error("Erro ao processar a planilha:", error.message);
    }
  };

  const handleUploadCSV = async (student) => {
    try {
      if (!student.Matrícula) {
        throw new Error("Matrícula inválida ou vazia");
      }
      const qrCodeURL = await generateQRCodeAndUpload(student.Matrícula);
      const { data, error } = await supabase.from("students").insert([
        {
          Nome: student.Nome,
          Curso: student.Curso,
          Série: student.Série,
          Telefone: student.Telefone,
          Email: student.Email,
          Matrícula: student.Matrícula,
          qr_code_url: qrCodeURL,
        },
      ]);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao inserir estudante do XLSX:", error.message);
    }
  };

  return (
    <div className="register-students">
      <div className="form-container">
        <div className="form-section">
          <h2 className="register-title">Cadastrar Estudantes</h2>
          <form onSubmit={handleUpload} className="register-form">
            <div className="form-group">
              <label className="form-label">Nome:</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Curso:</label>
              <select
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                required
                className="form-select"
              >
                <option value="">Selecione o curso</option>
                <option value="Biotecnologia">Biotecnologia</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Agropecuária">Agropecuária</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Série:</label>
              <input
                type="text"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone:</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Matrícula:</label>
              <input
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="register-button">
              Cadastrar Estudante
            </button>
          </form>
        </div>

        <div className="upload-section">
          <h2 className="upload-title">Upload da Planilha</h2>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input"
          />
          {file && (
            <button
              onClick={() => processFile(file)}
              className="process-button" // Mantendo o botão Processar sem alterações
            >
              Processar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterStudents;
