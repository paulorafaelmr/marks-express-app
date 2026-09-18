"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    });
  }, [router]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErro("");
    setMensagem("");

    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setErro("Não foi possível entrar. Confira seu e-mail e senha.");
      } else {
        router.replace("/");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (error) {
        setErro(error.message);
      } else if (data.session) {
        router.replace("/");
      } else {
        setMensagem(
          "Conta criada. Confira seu e-mail para confirmar o acesso e depois entre normalmente."
        );
        setModo("entrar");
      }
    }

    setLoading(false);
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>Marks Express</strong>
            <span>Gestão de fretes</span>
          </div>
        </div>

        <div className="login-copy">
          <p className="eyebrow">ACESSO</p>
          <h1>{modo === "entrar" ? "Entrar no sistema" : "Criar acesso"}</h1>
          <p>
            {modo === "entrar"
              ? "Acesse seus fretes, pendências e resultados."
              : "Crie seu acesso para começar a usar o sistema."}
          </p>
        </div>

        <form className="login-form" onSubmit={enviar}>
          <label>
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
            />
          </label>

          {erro && <div className="notice error-notice">{erro}</div>}
          {mensagem && <div className="notice success-notice">{mensagem}</div>}

          <button className="primary-button login-submit" disabled={loading}>
            {loading
              ? "Aguarde..."
              : modo === "entrar"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>

        <button
          className="login-switch"
          type="button"
          onClick={() => {
            setModo(modo === "entrar" ? "criar" : "entrar");
            setErro("");
            setMensagem("");
          }}
        >
          {modo === "entrar"
            ? "Primeiro acesso? Criar uma conta"
            : "Já tenho acesso"}
        </button>
      </section>
    </main>
  );
}
