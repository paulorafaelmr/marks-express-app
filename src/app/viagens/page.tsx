"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import { calcularFrete, dataBr, mesAtualInput, moeda } from "@/lib/fretes";
import { supabase } from "@/lib/supabase";
import type { ConfiguracoesFrete, Frete, StatusFrete } from "@/lib/types";

export default function ViagensPage() {
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [config, setConfig] = useState<ConfiguracoesFrete | null>(null);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [mes, setMes] = useState(mesAtualInput());
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      const [fretesResult, configResult] = await Promise.all([
        supabase.from("fretes").select("*").order("data", { ascending: false }),
        supabase.from("configuracoes_frete").select("*").maybeSingle(),
      ]);

      if (fretesResult.error || configResult.error) {
        setErro("Não foi possível carregar os fretes.");
      } else {
        setFretes((fretesResult.data ?? []) as Frete[]);
        setConfig(configResult.data as ConfiguracoesFrete | null);
      }

      setLoading(false);
    }

    carregar();
  }, []);

  const linhas = useMemo(() => {
    if (!config) return [];

    return fretes
      .filter((frete) => !mes || frete.data.startsWith(mes))
      .map((frete) => ({ frete, calc: calcularFrete(frete, config) }))
      .filter(({ frete, calc }) => {
        const termo = busca.trim().toLowerCase();
        const texto = [
          frete.empresa_agenciador,
          frete.origem,
          frete.destino,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const bateBusca = !termo || texto.includes(termo);
        const bateStatus = status === "todos" || calc.status === status;

        return bateBusca && bateStatus;
      });
  }, [fretes, config, busca, status, mes]);

  return (
    <AuthGuard>
      <AppShell>
        <header className="page-topbar">
          <div>
            <p className="eyebrow">FRETES</p>
            <h1>Viagens</h1>
            <p className="subtitle">Uma linha por viagem, com leitura rápida e simples.</p>
          </div>

          <Link className="primary-button" href="/viagens/nova">
            + Nova viagem
          </Link>
        </header>

        {erro && <div className="notice error-notice">{erro}</div>}

        <section className="freight-toolbar">
          <input
            placeholder="Buscar empresa, origem ou destino..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="Aguardando adiantamento">Aguardando adiantamento</option>
            <option value="Em viagem">Em viagem</option>
            <option value="Aguardando saldo">Aguardando saldo</option>
            <option value="Comissão pendente">Comissão pendente</option>
            <option value="Finalizado">Finalizado</option>
          </select>

          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
        </section>

        <section className="panel freight-panel">
          <div className="freight-table-head">
            <span>Data</span>
            <span>Rota</span>
            <span>Empresa</span>
            <span>Frete</span>
            <span>Sobra</span>
            <span>Status</span>
          </div>

          {loading ? (
            <div className="empty-state"><p>Carregando fretes...</p></div>
          ) : linhas.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum frete encontrado</h3>
              <p>Cadastre uma viagem ou altere os filtros para visualizar outros fretes.</p>
              <Link className="secondary-button" href="/viagens/nova">Cadastrar viagem</Link>
            </div>
          ) : (
            <div className="freight-list">
              {linhas.map(({ frete, calc }) => (
                <Link className="freight-row" href={"/viagens/" + frete.id} key={frete.id}>
                  <span className="freight-date">{dataBr(frete.data)}</span>
                  <div className="freight-route">
                    <strong>{frete.origem} → {frete.destino}</strong>
                    <small>{frete.km_aproximados ? Number(frete.km_aproximados).toLocaleString("pt-BR") + " km" : "KM não informado"}</small>
                  </div>
                  <span className="freight-company">{frete.empresa_agenciador || "—"}</span>
                  <strong>{moeda(calc.valorFrete)}</strong>
                  <strong className={calc.sobraEstimada < 0 ? "negative-value" : ""}>{moeda(calc.sobraEstimada)}</strong>
                  <StatusBadge status={calc.status as StatusFrete} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </AppShell>
    </AuthGuard>
  );
}
