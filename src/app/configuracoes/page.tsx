"use client";

import { FormEvent, useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

export default function ConfiguracoesPage() {
  const [comissao, setComissao] = useState("13");
  const [media, setMedia] = useState("3");
  const [diesel, setDiesel] = useState("5,80");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("configuracoes_frete")
        .select("*")
        .maybeSingle();

      if (error) {
        setErro("Não foi possível carregar as configurações.");
      } else if (data) {
        setComissao(String(Number(data.comissao_motorista) * 100).replace(".", ","));
        setMedia(String(Number(data.media_caminhao_km_l)).replace(".", ","));
        setDiesel(Number(data.preco_medio_diesel).toFixed(2).replace(".", ","));
      } else {
        await supabase.from("configuracoes_frete").insert({
          user_id: user.id,
          comissao_motorista: 0.13,
          media_caminhao_km_l: 3,
          preco_medio_diesel: 5.8,
        });
      }

      setLoading(false);
    }

    carregar();
  }, []);

  function parse(value: string) {
    return Number(value.replace(".", "").replace(",", "."));
  }

  async function salvar(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    setErro("");

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setErro("Sua sessão expirou. Entre novamente.");
      setSalvando(false);
      return;
    }

    const percentual = parse(comissao) / 100;
    const mediaNumero = parse(media);
    const dieselNumero = parse(diesel);

    if (
      !Number.isFinite(percentual) ||
      percentual < 0 ||
      percentual > 1 ||
      !Number.isFinite(mediaNumero) ||
      mediaNumero <= 0 ||
      !Number.isFinite(dieselNumero) ||
      dieselNumero < 0
    ) {
      setErro("Confira os valores informados.");
      setSalvando(false);
      return;
    }

    const { error } = await supabase
      .from("configuracoes_frete")
      .upsert({
        user_id: user.id,
        comissao_motorista: percentual,
        media_caminhao_km_l: mediaNumero,
        preco_medio_diesel: dieselNumero,
      });

    if (error) setErro("Não foi possível salvar as configurações.");
    else setMensagem("Configurações atualizadas.");

    setSalvando(false);
  }

  return (
    <AuthGuard>
      <AppShell>
        <header className="page-topbar">
          <div>
            <p className="eyebrow">CONFIGURAÇÕES</p>
            <h1>Parâmetros dos fretes</h1>
            <p className="subtitle">
              Esses valores alimentam os cálculos automáticos de todas as viagens.
            </p>
          </div>
        </header>

        <form className="panel form-panel" onSubmit={salvar}>
          <div className="form-section">
            <h2>Parâmetros atuais</h2>

            <div className="form-grid">
              <label>
                Comissão do motorista (%)
                <input
                  value={comissao}
                  onChange={(e) => setComissao(e.target.value)}
                  disabled={loading}
                  inputMode="decimal"
                />
              </label>

              <label>
                Média do caminhão (km/L)
                <input
                  value={media}
                  onChange={(e) => setMedia(e.target.value)}
                  disabled={loading}
                  inputMode="decimal"
                />
              </label>

              <label>
                Preço médio do diesel (R$/L)
                <input
                  value={diesel}
                  onChange={(e) => setDiesel(e.target.value)}
                  disabled={loading}
                  inputMode="decimal"
                />
              </label>
            </div>
          </div>

          <div className="calculation-note">
            Alterar esses valores muda os cálculos exibidos no Dashboard e nos fretes.
          </div>

          {erro && <div className="notice error-notice">{erro}</div>}
          {mensagem && <div className="notice success-notice">{mensagem}</div>}

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={loading || salvando}>
              {salvando ? "Salvando..." : "Salvar configurações"}
            </button>
          </div>
        </form>
      </AppShell>
    </AuthGuard>
  );
}
