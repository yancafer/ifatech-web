import React, { useState } from "react";
import { supabase } from "../../connections/supabaseClient"; // Conexão com o Supabase
import { useNavigate } from "react-router-dom";
import "./style.css"; // Importação do arquivo CSS

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Para exibir erros
  const [loading, setLoading] = useState(false); // Para exibir um loader
  const navigate = useNavigate();

  // Função para validar o formato do email
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Função para validar os requisitos da senha
  const validatePassword = (password) => {
    return password.length >= 6; // A senha deve ter no mínimo 6 caracteres
  };

  async function newUser() {
    if (!validateEmail(email)) {
      setError("Email inválido!");
      return;
    }

    if (!validatePassword(password)) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // Criar o usuário admin no Supabase
      const { data: user, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      // Garantir que o usuário foi criado
      const userId = user?.user?.id;
      if (!userId) {
        throw new Error("Falha ao criar usuário.");
      }

      // Esperar alguns segundos para garantir que o ID foi propagado para a tabela `users`
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Após criar o usuário, inserir o perfil com o papel "admin"
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId, // Usar o ID gerado do usuário
          role: "admin", // O novo usuário será admin
          email: email, // Atribuir o email diretamente
        },
      ]);

      if (profileError) {
        throw profileError;
      }

      // Limpar os campos após a criação bem-sucedida
      setEmail("");
      setPassword("");
      setError("");

      console.log("Admin criado com sucesso");
      navigate("/login"); // Redirecionar após o registro
    } catch (error) {
      setError("Erro ao registrar: " + error.message);
      console.error("Erro ao registrar usuário:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {loading && (
        <div className="loader"></div> // Loader estilizado
      )}
      <div className="login-box">
        <h1 className="title-home">Criar Conta de Admin</h1>
        <div className="input-login">
          <label>Email</label>
          <input
            type="email"
            className="input-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite um email"
          />
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua melhor senha"
          />
          <button onClick={newUser} disabled={loading} className="button-login">
            Criar Conta
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
