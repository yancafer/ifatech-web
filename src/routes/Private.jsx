import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../connections/supabaseClient"; // Conexão com Supabase
import Menu from "../components/Menu";

export default function Private({ children }) {
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      // Verifica o estado de autenticação do usuário no Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Usuário autenticado, salvar informações no localStorage se necessário
        const userData = {
          uid: session.user.id,
          email: session.user.email,
        };
        localStorage.setItem("@detailUser", JSON.stringify(userData));

        setSigned(true);
      } else {
        setSigned(false);
      }
      
      setLoading(false);
    }

    checkLogin();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Menu />
      {children}
    </div>
  );
}
