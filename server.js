const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 CONFIG DO SUPABASE
const SUPABASE_URL = "https://phcxwdkvxunuotilvjlv.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoY3h3ZGt2eHVudW90aWx2amx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzM3NTksImV4cCI6MjA4MDMwOTc1OX0.n3b8Po3gbjds6XtStZ-BlGotlvNsmKt2RdrDKRXZjqw";

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// =====================================================================
// 📌 LISTAR USUÁRIOS
// =====================================================================
app.get("/usuarios", async (req, res) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.log("❌ ERRO AO LISTAR:", error);
    return res.status(400).json({ error });
  }

  res.json(data);
});

// =====================================================================
// 📌 CADASTRAR USUÁRIO
// =====================================================================
app.post("/usuarios", async (req, res) => {
  const { nome, email, senha, tokenExpo } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  const { data, error } = await supabase
    .from("usuarios")
    .insert([
      {
        nome,
        email,
        senha,
        tokenexpo: tokenExpo || null,
      },
    ])
    .select();

  if (error) {
    console.log("❌ ERRO AO SALVAR:", error);
    return res.status(400).json({ error });
  }

  res.json({
    sucesso: true,
    usuario: data[0],
  });
});

// =====================================================================
// 📌 SERVIDOR LOCAL
// =====================================================================
app.listen(3001, "0.0.0.0", () => {
  console.log("Servidor rodando em:");
  console.log("➡ PC: http://localhost:3001");
  console.log("➡ Celular: http://SEU_IP_LOCAL:3001");
});
