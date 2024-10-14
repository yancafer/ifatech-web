import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../connections/firebaseConnections";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    // Se as validações passarem, tente fazer o login
    await signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setEmail(""); // Limpar campos após login
        setPassword("");
        setError(""); // Limpar qualquer erro anterior

        // Redirecionar para a dashboard
        navigate("/reports");
      })
      .catch(() => {
        setError("Email ou senha inválidos");
      });
  }

  return (
    <div>
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
  );
}

export default Login;
