"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Settings2, Truck } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import { calcularFrete, dataBr, estaNoMes, mesAtualInput, moeda } from "@/lib/fretes";
import { supabase } from "@/lib/supabase";
import type { ConfiguracoesFrete, Frete } from "@/lib/types";

export default function Dashboard() {
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [config, setConfig] = useState<ConfiguracoesFrete | null>(null);
  const [mes, setMes] = useState(mesAtualInput());
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setErro("");

      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const [fretesResult, configResult] = await Promise.all([
        supabase.from("fretes").select("*").order("data", { ascending: false }),
        supabase.from("configuracoes_frete").select("*").maybeSingle(),
      ]);

      if (fretesResult.error || configResult.error) {
        setErro("Não foi possível carregar os dados.");
        setLoading(false);
        return;
      }

      setFretes((fretesResult.data ?? []) as Frete[]);

      if (configResult.data) {
        setConfig(configResult.data as ConfiguracoesFrete);
      } else {
        const { data, error } = await supabase
          .from("configuracoes_frete")
          .insert({
            user_id: user.id,
            comissao_motorista: 0.13,
            media_caminhao_km_l: 3,
            preco_medio_diesel: 5.8,
          })
          .select()
          .single();

        if (error) setErro("Não foi possível criar as configurações iniciais.");
        else setConfig(data as ConfiguracoesFrete);
      }

      setLoading(false);
    }

    carregar();
  }, []);

  const viagensMes = useMemo(() => {
    if (!config) return [];
    return fretes
      .filter((frete) => estaNoMes(frete.data, mes))
      .map((frete) => ({ frete, calc: calcularFrete(frete, config) }));
  }, [fretes, config, mes]);

  const resumo = useMemo(
    () =>
      viagensMes.reduce(
        (acc, item) => {
          acc.faturamento += item.calc.valorFrete;
          acc.sobra += item.calc.sobraEstimada;
          acc.aReceber += item.calc.aReceber;
          acc.comissao += item.calc.comissaoPendente;
          acc.diesel += item.calc.dieselEstimado;
          return acc;
        },
        { faturamento: 0, sobra: 0, aReceber: 0, comissao: 0, diesel: 0 }
      ),
    [viagensMes]
  );

  const atencao = useMemo(() => {
    if (!config) return [];
    return fretes
      .map((frete) => ({ frete, calc: calcularFrete(frete, config) }))
      .filter((item) => item.calc.status !== "Finalizado")
      .slice(0, 5);
  }, [fretes, config]);

  return (
    <AuthGuard>
      <AppShell>
        <header className="page-topbar">
          <div>
            <p className="eyebrow">VISÃO GERAL</p>
            <h1>Dashboard</h1>
            <p className="subtitle">Resumo das viagens e pendências do caminhão.</p>
          </div>

          <div className="topbar-actions">
            <input
              className="month-input"
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            />
            <Link className="primary-button" href="/viagens/nova">
              <Plus size={18} />
              Nova viagem
            </Link>
          </div>
        </header>

        {erro && <div className="notice error-notice">{erro}</div>}

        <section className="metrics-grid metrics-five dashboard-metrics">
          <article className="metric-card dashboard-metric">
            <span>Faturamento</span>
            <strong>{moeda(resumo.faturamento)}</strong>
            <small>{viagensMes.length} viagens no mês</small>
          </article>
          <article className="metric-card dashboard-metric">
            <span>Sobra estimada</span>
            <strong>{moeda(resumo.sobra)}</strong>
            <small>Após custos das viagens</small>
          </article>
          <article className="metric-card dashboard-metric">
            <span>A receber</span>
            <strong>{moeda(resumo.aReceber)}</strong>
            <small>Adiantamentos e saldos</small>
          </article>
          <article className="metric-card dashboard-metric">
            <span>Comissão pendente</span>
            <strong>{moeda(resumo.comissao)}</strong>
            <small>Motorista</small>
          </article>
          <article className="metric-card dashboard-metric">
            <span>Diesel estimado</span>
            <strong>{moeda(resumo.diesel)}</strong>
            <small>Com base nos KM</small>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel panel-large attention-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">ACOMPANHAMENTO DE VIAGENS</p>
              </div>
              <Link href="/viagens">Ver todos os fretes</Link>
            </div>

            {loading ? (
              <div className="empty-state compact"><p>Carregando...</p></div>
            ) : atencao.length === 0 ? (
              <div className="empty-state compact">
                <div className="empty-icon"><Truck size={23} /></div>
                <h3>Nenhuma pendência</h3>
                <p>As viagens em andamento e pagamentos pendentes aparecerão aqui.</p>
              </div>
            ) : (
              <div className="recent-list">
                {atencao.map(({ frete, calc }) => (
                  <Link className="recent-item" href={"/viagens/" + frete.id} key={frete.id}>
                    <div className="recent-route">
                      <span>{dataBr(frete.data)}</span>
                      <strong>{frete.origem} → {frete.destino}</strong>
                      <small>{frete.empresa_agenciador || "Sem empresa informada"}</small>
                    </div>
                    <div className="recent-value">
                      <strong>{moeda(calc.valorFrete)}</strong>
                      <StatusBadge status={calc.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          <div className="dashboard-side">
            <article className="panel settings-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">PARÂMETROS</p>
                  <h2>Configuração atual</h2>
                </div>
                <Link className="icon-link" href="/configuracoes"><Settings2 size={17} /></Link>
              </div>

              <div className="parameter-list">
                <div><span>Comissão do motorista</span><strong>{config ? (Number(config.comissao_motorista) * 100).toFixed(0) + "%" : "..."}</strong></div>
                <div><span>Média do caminhão</span><strong>{config ? Number(config.media_caminhao_km_l).toFixed(1).replace(".", ",") + " km/L" : "..."}</strong></div>
                <div><span>Diesel médio</span><strong>{config ? moeda(Number(config.preco_medio_diesel)) + "/L" : "..."}</strong></div>
              </div>
            </article>
          </div>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
