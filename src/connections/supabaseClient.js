import { createClient } from "@supabase/supabase-js";

// Inicialização do cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exemplo de chamada ao Supabase
const fetchData = async () => {
  const { data, error } = await supabase.from("sua_tabela").select("*");
  console.log("Data:", data);
  console.log("Error:", error);
};

// Chame a função após a inicialização
fetchData();
