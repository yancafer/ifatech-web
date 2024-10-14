import React, { useState } from "react";
import { supabase } from "../../connections/supabaseClient"; // Conexão com o Supabase
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './login.css'; // Estilos personalizados

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Função para validar o formato do email
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Função para validar os requisitos da senha
  const validatePassword = (password) => {
    // A senha deve ter no mínimo 6 caracteres
    return password.length >= 6;
  };

  async function loginUser() {
    // Validações de email e senha
    if (!validateEmail(email)) {
      setError("Email inválido!");
      return;
    }

    if (!validatePassword(password)) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true); // Mostrar loader

    // Tentar fazer o login no Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false); // Ocultar loader em caso de erro
      setError("Email ou senha inválidos");
      toast.error("Erro ao fazer login!");
    } else {
      setEmail(""); // Limpar campos após login
      setPassword("");
      setError(""); // Limpar qualquer erro anterior

      toast.success("Login bem-sucedido!");

      setTimeout(() => {
        navigate("/reports"); // Redirecionar após o login
      }, 1000); // Aguardar 2 segundos para mostrar o loader e o toast
    }
  }

  return (
    <div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {loading ? (
        <div className="loader"></div> // Exibir apenas o loader durante o login
      ) : (
        <div className="login-container">
          <h1>Login</h1>
          {error && <p style={{ color: "red" }}>{error}</p>} {/* Exibir erros */}
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
            />

            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />

            <button onClick={loginUser}>Entrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
