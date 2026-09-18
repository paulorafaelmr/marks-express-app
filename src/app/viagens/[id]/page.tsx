"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import { calcularFrete, dataBr, moeda } from "@/lib/fretes";
import { supabase } from "@/lib/supabase";
import type { ConfiguracoesFrete, Frete } from "@/lib/types";

type EtapaKey =
  | "adiantamento_recebido"
  | "comissao_adiantamento_paga"
  | "carga_entregue"
  | "saldo_recebido"
  | "comissao_saldo_paga";

export default function DetalheViagemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [frete, setFrete] = useState<Frete | null>(null);
  const [config, setConfig] = useState<ConfiguracoesFrete | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    setLoading(true);
    setErro("");

    const [freteResult, configResult] = await Promise.all([
      supabase.from("fretes").select("*").eq("id", params.id).single(),
      supabase.from("configuracoes_frete").select("*").maybeSingle(),
    ]);

    if (freteResult.error || !freteResult.data || configResult.error || !configResult.data) {
      setErro("Não foi possível carregar esta viagem.");
    } else {
      setFrete(freteResult.data as Frete);
      setConfig(configResult.data as ConfiguracoesFrete);
    }

    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, [params.id]);

  async function alternar(campo: EtapaKey, valor: boolean) {
    if (!frete) return;

    setSalvando(campo);
    setErro("");

    const { error } = await supabase
      .from("fretes")
      .update({ [campo]: valor })
      .eq("id", frete.id);

    if (error) {
      setErro("Não foi possível atualizar esta etapa.");
    } else {
      setFrete({ ...frete, [campo]: valor });
    }

    setSalvando("");
  }

  async function excluir() {
    if (!frete) return;
    if (!window.confirm("Excluir esta viagem? Essa ação não pode ser desfeita.")) return;

    const { error } = await supabase.from("fretes").delete().eq("id", frete.id);

    if (error) setErro("Não foi possível excluir a viagem.");
    else router.push("/viagens");
  }

  const calc = frete && config ? calcularFrete(frete, config) : null;

  return (
    <AuthGuard>
      <AppShell>
        {loading ? (
          <div className="empty-state"><p>Carregando viagem...</p></div>
        ) : !frete || !config || !calc ? (
          <div className="empty-state">
            <h3>Viagem não encontrada</h3>
            <p>{erro || "Esse frete não está disponível."}</p>
            <Link className="secondary-button" href="/viagens">Voltar para fretes</Link>
          </div>
        ) : (
          <>
            <header className="page-topbar">
              <div>
                <Link className="back-link" href="/viagens">← Voltar para fretes</Link>
                <p className="eyebrow">{dataBr(frete.data)}</p>
                <h1>{frete.origem} → {frete.destino}</h1>
                <p className="subtitle">{frete.empresa_agenciador || "Sem empresa informada"}</p>
              </div>

              <div className="detail-header-actions">
                <Link className="secondary-button" href={"/viagens/" + frete.id + "/editar"}>
                  Editar viagem
                </Link>
                <StatusBadge status={calc.status} />
              </div>
            </header>

            {erro && <div className="notice error-notice">{erro}</div>}

            <section className="detail-metrics">
              <article className="metric-card"><span>Valor do frete</span><strong>{moeda(calc.valorFrete)}</strong><small>Valor total</small></article>
              <article className="metric-card"><span>Sobra estimada</span><strong>{moeda(calc.sobraEstimada)}</strong><small>Resultado da viagem</small></article>
              <article className="metric-card"><span>A receber</span><strong>{moeda(calc.aReceber)}</strong><small>Valores pendentes</small></article>
              <article className="metric-card"><span>Diesel estimado</span><strong>{moeda(calc.dieselEstimado)}</strong><small>{frete.km_aproximados ? Number(frete.km_aproximados).toLocaleString("pt-BR") + " km" : "KM não informado"}</small></article>
            </section>

            <section className="detail-grid">
              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">ANDAMENTO</p>
                    <h2>Etapas da viagem</h2>
                  </div>
                </div>

                <div className="steps-list">
                  <Step label="Adiantamento recebido" value={frete.adiantamento_recebido} disabled={salvando !== ""} onChange={(value) => alternar("adiantamento_recebido", value)} />
                  <Step label="Comissão do adiantamento paga" value={frete.comissao_adiantamento_paga} disabled={salvando !== ""} onChange={(value) => alternar("comissao_adiantamento_paga", value)} />
                  <Step label="Carga entregue" value={frete.carga_entregue} disabled={salvando !== ""} onChange={(value) => alternar("carga_entregue", value)} />
                  <Step label="Saldo recebido" value={frete.saldo_recebido} disabled={salvando !== ""} onChange={(value) => alternar("saldo_recebido", value)} />
                  <Step label="Comissão do saldo paga" value={frete.comissao_saldo_paga} disabled={salvando !== ""} onChange={(value) => alternar("comissao_saldo_paga", value)} />
                </div>
              </article>

              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">VALORES</p>
                    <h2>Resumo financeiro</h2>
                  </div>
                </div>

                <div className="parameter-list">
                  <div><span>Adiantamento</span><strong>{moeda(calc.adiantamento)}</strong></div>
                  <div><span>Comissão do adiantamento</span><strong>{moeda(calc.comissaoAdiantamento)}</strong></div>
                  <div><span>Saldo do frete</span><strong>{moeda(calc.saldoFrete)}</strong></div>
                  <div><span>Comissão do saldo</span><strong>{moeda(calc.comissaoSaldo)}</strong></div>
                  <div><span>Comissão total</span><strong>{moeda(calc.comissaoTotal)}</strong></div>
                  <div><span>Comissão pendente</span><strong>{moeda(calc.comissaoPendente)}</strong></div>
                  <div><span>Pedágio descontado</span><strong>{moeda(calc.pedagioDescontado)}</strong></div>
                  <div><span>Outras despesas</span><strong>{moeda(calc.outrasDespesas)}</strong></div>
                </div>
              </article>
            </section>

            {frete.observacoes && (
              <section className="panel detail-observation">
                <p className="eyebrow">OBSERVAÇÕES</p>
                <p>{frete.observacoes}</p>
              </section>
            )}

            <div className="danger-zone">
              <button className="danger-button" type="button" onClick={excluir}>Excluir viagem</button>
            </div>
          </>
        )}
      </AppShell>
    </AuthGuard>
  );
}

function Step({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={"step-item " + (value ? "done" : "")}>
      <input
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
      <strong>{value ? "Concluído" : "Pendente"}</strong>
    </label>
  );
}
