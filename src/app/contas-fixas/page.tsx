"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import { moeda, mesAtualInput } from "@/lib/fretes";
import { supabase } from "@/lib/supabase";

type ContaFixa = {
  id: string;
  nome: string;
  valor: number | string;
  ativo: boolean;
};

type ContaMensal = {
  id: string;
  conta_id: string;
  mes: string;
  pago: boolean;
  pago_em: string | null;
};

function numero(value: string) {
  const normalizado = value
    .replace(/R\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalizado);
  return Number.isFinite(parsed) ? parsed : 0;
}

function tituloMes(value: string) {
  const [ano, mes] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(ano, mes - 1, 1));
}

export default function ContasFixasPage() {
  const [mes, setMes] = useState(mesAtualInput());
  const [contas, setContas] = useState<ContaFixa[]>([]);
  const [mensais, setMensais] = useState<Record<string, ContaMensal>>({});
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregar() {
    setLoading(true);
    setErro("");

    const mesData = mes + "-01";

    const [contasResult, mensalResult] = await Promise.all([
      supabase
        .from("contas_fixas")
        .select("id,nome,valor,ativo")
        .eq("ativo", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("contas_fixas_mensal")
        .select("id,conta_id,mes,pago,pago_em")
        .eq("mes", mesData),
    ]);

    if (contasResult.error || mensalResult.error) {
      setErro("Não foi possível carregar as contas fixas.");
      setLoading(false);
      return;
    }

    setContas((contasResult.data ?? []) as ContaFixa[]);

    const mapa: Record<string, ContaMensal> = {};
    for (const item of (mensalResult.data ?? []) as ContaMensal[]) {
      mapa[item.conta_id] = item;
    }
    setMensais(mapa);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, [mes]);

  async function adicionar(event: FormEvent) {
    event.preventDefault();
    setErro("");

    const valorNumero = numero(valor);

    if (!nome.trim() || valorNumero <= 0) {
      setErro("Informe o nome da conta e um valor maior que zero.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.from("contas_fixas").insert({
      nome: nome.trim(),
      valor: valorNumero,
    });

    if (error) {
      setErro("Não foi possível adicionar a conta fixa.");
    } else {
      setNome("");
      setValor("");
      await carregar();
    }

    setSalvando(false);
  }

  async function alternarPago(contaId: string) {
    setErro("");

    const atual = mensais[contaId];
    const novoValor = !atual?.pago;
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setErro("Sua sessão expirou. Entre novamente.");
      return;
    }

    const { data, error } = await supabase
      .from("contas_fixas_mensal")
      .upsert(
        {
          user_id: user.id,
          conta_id: contaId,
          mes: mes + "-01",
          pago: novoValor,
          pago_em: novoValor ? new Date().toISOString() : null,
        },
        { onConflict: "conta_id,mes" }
      )
      .select("id,conta_id,mes,pago,pago_em")
      .single();

    if (error) {
      setErro("Não foi possível atualizar essa conta.");
      return;
    }

    setMensais((prev) => ({
      ...prev,
      [contaId]: data as ContaMensal,
    }));
  }

  const total = useMemo(
    () => contas.reduce((acc, conta) => acc + Number(conta.valor), 0),
    [contas]
  );

  const totalPago = useMemo(
    () =>
      contas.reduce(
        (acc, conta) =>
          acc + (mensais[conta.id]?.pago ? Number(conta.valor) : 0),
        0
      ),
    [contas, mensais]
  );

  const concluidas = useMemo(
    () => contas.filter((conta) => mensais[conta.id]?.pago).length,
    [contas, mensais]
  );

  return (
    <AuthGuard>
      <AppShell>
        <header className="page-topbar">
          <div>
            <p className="eyebrow">CONTAS FIXAS</p>
            <h1>Despesas mensais</h1>
            <p className="subtitle">
              Marque cada conta como concluída mês a mês.
            </p>
          </div>

          <input
            className="month-input"
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          />
        </header>

        {erro && <div className="notice error-notice">{erro}</div>}

        <section className="fixed-summary">
          <article className="panel fixed-summary-main">
            <span>Total fixo de {tituloMes(mes)}</span>
            <strong>{moeda(total)}</strong>
            <small>{contas.length} contas cadastradas</small>
          </article>

          <article className="panel fixed-summary-small">
            <span>Concluído no mês</span>
            <strong>{moeda(totalPago)}</strong>
            <small>{concluidas} de {contas.length} contas</small>
          </article>
        </section>

        <section className="panel fixed-add-panel">
          <div>
            <p className="eyebrow">NOVA CONTA</p>
            <h2>Adicionar conta fixa</h2>
          </div>

          <form className="fixed-add-form" onSubmit={adicionar}>
            <input
              placeholder="Ex.: Seguro do caminhão"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              placeholder="R$ 0,00"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
            <button className="primary-button" type="submit" disabled={salvando}>
              <Plus size={17} />
              {salvando ? "Adicionando..." : "Adicionar"}
            </button>
          </form>
        </section>

        <section className="panel fixed-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MÊS ATUAL</p>
              <h2>{tituloMes(mes)}</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-state compact">
              <p>Carregando contas...</p>
            </div>
          ) : contas.length === 0 ? (
            <div className="empty-state compact">
              <h3>Nenhuma conta fixa cadastrada</h3>
              <p>
                Adicione as despesas recorrentes do caminhão para acompanhar mês a mês.
              </p>
            </div>
          ) : (
            <div className="fixed-list">
              {contas.map((conta) => {
                const pago = Boolean(mensais[conta.id]?.pago);

                return (
                  <button
                    className={"fixed-row " + (pago ? "done" : "")}
                    key={conta.id}
                    type="button"
                    onClick={() => alternarPago(conta.id)}
                  >
                    <span className="fixed-check">
                      {pago ? <CheckCircle2 size={23} /> : <Circle size={23} />}
                    </span>

                    <span className="fixed-name">
                      <strong>{conta.nome}</strong>
                      <small>{pago ? "Concluído neste mês" : "Pendente neste mês"}</small>
                    </span>

                    <strong className="fixed-value">{moeda(Number(conta.valor))}</strong>
                  </button>
                );
              })}
            </div>
          )}

          <div className="fixed-total-row">
            <span>Total das contas fixas</span>
            <strong>{moeda(total)}</strong>
          </div>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
