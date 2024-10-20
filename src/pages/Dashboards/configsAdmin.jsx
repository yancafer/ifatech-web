import React, { useState } from "react";
import { supabase } from "../../connections/supabaseClient"; // Conexão com o Supabase
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/configsAdmin.css"; // Importando o arquivo CSS

function ConfigsAdmin() {
  const [adminData, setAdminData] = useState({
    email: "",
    senha: "",
  });

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminData.email || !adminData.senha) {
      toast.error("Por favor, preencha todos os campos!");
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.senha,
      });

      if (authError) throw authError;
      if (!authData?.user)
        throw new Error("Erro ao registrar usuário. Tente novamente.");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          { id: authData.user.id, email: adminData.email, role: "admin" },
        ]);

      if (profileError) {
        console.log("Erro ao inserir perfil:", profileError); // Log do erro
        throw profileError;
      }

      console.log("Dados do perfil criado:", profileData); // Log dos dados de perfil

      setAdminData({ email: "", senha: "" });
      toast.success("Admin cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar o admin:", error); // Log do erro geral
      toast.error("Erro ao cadastrar o admin. Tente novamente.");
    }
  };

  return (
    <div className="configs-admin">
      <ToastContainer />
      <h1 className="title">Cadastro de Admin</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            value={adminData.email}
            onChange={handleChange}
            placeholder="Digite o email"
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="label">Senha</label>
          <input
            type="password"
            name="senha"
            value={adminData.senha}
            onChange={handleChange}
            placeholder="Digite a senha"
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-button">
          Cadastrar Admin
        </button>
      </form>
    </div>
  );
}

export default ConfigsAdmin;
