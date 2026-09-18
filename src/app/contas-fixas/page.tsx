"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, CreditCard, Plus } from "lucide-react";
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

type ParcelaCartao = {
  id: string;
  descricao: string;
  cartao: string | null;
  valor_parcela: number | string;
  total_parcelas: number;
  parcela_inicial: number;
  mes_referencia: string;
  ativo: boolean;
};

type ParcelaMensal = {
  id: string;
  parcela_id: string;
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

function monthIndex(value: string) {
  const [ano, mes] = value.slice(0, 7).split("-").map(Number);
  return ano * 12 + (mes - 1);
}

function addMonths(value: string, amount: number) {
  const [ano, mes] = value.slice(0, 7).split("-").map(Number);
  const date = new Date(ano, mes - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function mesCurto(value: string) {
  const [ano, mes] = value.slice(0, 7).split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  })
    .format(new Date(ano, mes - 1, 1))
    .replace(".", "");
}

export default function ContasFixasPage() {
  const [mes, setMes] = useState(mesAtualInput());

  const [contas, setContas] = useState<ContaFixa[]>([]);
  const [mensais, setMensais] = useState<Record<string, ContaMensal>>({});
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [salvandoConta, setSalvandoConta] = useState(false);

  const [parcelas, setParcelas] = useState<ParcelaCartao[]>([]);
  const [parcelasMensais, setParcelasMensais] = useState<Record<string, ParcelaMensal>>({});
  const [descricaoParcela, setDescricaoParcela] = useState("");
  const [cartao, setCartao] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [totalParcelas, setTotalParcelas] = useState("");
  const [parcelaAtual, setParcelaAtual] = useState("");
  const [salvandoParcela, setSalvandoParcela] = useState(false);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    setLoading(true);
    setErro("");

    const mesData = mes + "-01";

    const [contasResult, mensalResult, parcelasResult, parcelasMensaisResult] =
      await Promise.all([
        supabase
          .from("contas_fixas")
          .select("id,nome,valor,ativo")
          .eq("ativo", true)
          .order("created_at", { ascending: true }),
        supabase
          .from("contas_fixas_mensal")
          .select("id,conta_id,mes,pago,pago_em")
          .eq("mes", mesData),
        supabase
          .from("parcelas_cartao")
          .select("id,descricao,cartao,valor_parcela,total_parcelas,parcela_inicial,mes_referencia,ativo")
          .eq("ativo", true)
          .order("created_at", { ascending: true }),
        supabase
          .from("parcelas_cartao_mensal")
          .select("id,parcela_id,mes,pago,pago_em")
          .eq("mes", mesData),
      ]);

    if (
      contasResult.error ||
      mensalResult.error ||
      parcelasResult.error ||
      parcelasMensaisResult.error
    ) {
      setErro("Não foi possível carregar as despesas.");
      setLoading(false);
      return;
    }

    setContas((contasResult.data ?? []) as ContaFixa[]);
    setParcelas((parcelasResult.data ?? []) as ParcelaCartao[]);

    const mapaContas: Record<string, ContaMensal> = {};
    for (const item of (mensalResult.data ?? []) as ContaMensal[]) {
      mapaContas[item.conta_id] = item;
    }
    setMensais(mapaContas);

    const mapaParcelas: Record<string, ParcelaMensal> = {};
    for (const item of (parcelasMensaisResult.data ?? []) as ParcelaMensal[]) {
      mapaParcelas[item.parcela_id] = item;
    }
    setParcelasMensais(mapaParcelas);

    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, [mes]);

  async function adicionarConta(event: FormEvent) {
    event.preventDefault();
    setErro("");

    const valorNumero = numero(valor);

    if (!nome.trim() || valorNumero <= 0) {
      setErro("Informe o nome da conta e um valor maior que zero.");
      return;
    }

    setSalvandoConta(true);

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

    setSalvandoConta(false);
  }

  async function adicionarParcela(event: FormEvent) {
    event.preventDefault();
    setErro("");

    const valorNumero = numero(valorParcela);
    const total = Number(totalParcelas);
    const atual = Number(parcelaAtual);

    if (
      !descricaoParcela.trim() ||
      valorNumero <= 0 ||
      !Number.isInteger(total) ||
      total <= 0 ||
      !Number.isInteger(atual) ||
      atual <= 0 ||
      atual > total
    ) {
      setErro("Confira a descrição, o valor e a numeração das parcelas.");
      return;
    }

    setSalvandoParcela(true);

    const { error } = await supabase.from("parcelas_cartao").insert({
      descricao: descricaoParcela.trim(),
      cartao: cartao.trim() || null,
      valor_parcela: valorNumero,
      total_parcelas: total,
      parcela_inicial: atual,
      mes_referencia: mes + "-01",
    });

    if (error) {
      setErro("Não foi possível adicionar a parcela do cartão.");
    } else {
      setDescricaoParcela("");
      setCartao("");
      setValorParcela("");
      setTotalParcelas("");
      setParcelaAtual("");
      await carregar();
    }

    setSalvandoParcela(false);
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

  async function alternarParcelaPago(parcelaId: string) {
    setErro("");

    const atual = parcelasMensais[parcelaId];
    const novoValor = !atual?.pago;
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setErro("Sua sessão expirou. Entre novamente.");
      return;
    }

    const { data, error } = await supabase
      .from("parcelas_cartao_mensal")
      .upsert(
        {
          user_id: user.id,
          parcela_id: parcelaId,
          mes: mes + "-01",
          pago: novoValor,
          pago_em: novoValor ? new Date().toISOString() : null,
        },
        { onConflict: "parcela_id,mes" }
      )
      .select("id,parcela_id,mes,pago,pago_em")
      .single();

    if (error) {
      setErro("Não foi possível atualizar essa parcela.");
      return;
    }

    setParcelasMensais((prev) => ({
      ...prev,
      [parcelaId]: data as ParcelaMensal,
    }));
  }

  const parcelasDoMes = useMemo(() => {
    const selecionado = monthIndex(mes);

    return parcelas
      .map((item) => {
        const referencia = monthIndex(item.mes_referencia);
        const offset = selecionado - referencia;
        const numeroParcela = item.parcela_inicial + offset;

        if (numeroParcela < item.parcela_inicial || numeroParcela > item.total_parcelas) {
          return null;
        }

        const terminaEm = addMonths(
          item.mes_referencia,
          item.total_parcelas - item.parcela_inicial
        );

        return {
          ...item,
          numeroParcela,
          faltam: item.total_parcelas - numeroParcela,
          terminaEm,
        };
      })
      .filter(Boolean) as Array<
        ParcelaCartao & {
          numeroParcela: number;
          faltam: number;
          terminaEm: string;
        }
      >;
  }, [parcelas, mes]);

  const totalContas = useMemo(
    () => contas.reduce((acc, conta) => acc + Number(conta.valor), 0),
    [contas]
  );

  const totalContasPago = useMemo(
    () =>
      contas.reduce(
        (acc, conta) =>
          acc + (mensais[conta.id]?.pago ? Number(conta.valor) : 0),
        0
      ),
    [contas, mensais]
  );

  const totalParcelasMes = useMemo(
    () =>
      parcelasDoMes.reduce(
        (acc, item) => acc + Number(item.valor_parcela),
        0
      ),
    [parcelasDoMes]
  );

  const totalParcelasPago = useMemo(
    () =>
      parcelasDoMes.reduce(
        (acc, item) =>
          acc +
          (parcelasMensais[item.id]?.pago
            ? Number(item.valor_parcela)
            : 0),
        0
      ),
    [parcelasDoMes, parcelasMensais]
  );

  const totalComprometido = totalContas + totalParcelasMes;
  const totalConcluido = totalContasPago + totalParcelasPago;

  return (
    <AuthGuard>
      <AppShell>
        <header className="page-topbar">
          <div>
            <p className="eyebrow">CONTAS FIXAS</p>
            <h1>Despesas mensais</h1>
            <p className="subtitle">
              Contas recorrentes e parcelas do cartão organizadas mês a mês.
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

        <section className="expense-summary">
          <article className="panel expense-summary-main">
            <span>Total comprometido em {tituloMes(mes)}</span>
            <strong>{moeda(totalComprometido)}</strong>
            <small>Contas fixas + parcelas do cartão</small>
          </article>

          <article className="panel expense-summary-card">
            <span>Contas fixas</span>
            <strong>{moeda(totalContas)}</strong>
            <small>{contas.length} contas recorrentes</small>
          </article>

          <article className="panel expense-summary-card">
            <span>Parcelas no cartão</span>
            <strong>{moeda(totalParcelasMes)}</strong>
            <small>{parcelasDoMes.length} parcelas neste mês</small>
          </article>

          <article className="panel expense-summary-card">
            <span>Concluído no mês</span>
            <strong>{moeda(totalConcluido)}</strong>
            <small>Do total comprometido</small>
          </article>
        </section>

        <section className="expense-sections">
          <div className="expense-column">
            <section className="panel fixed-add-panel stacked">
              <div>
                <p className="eyebrow">RECORRENTE</p>
                <h2>Adicionar conta fixa</h2>
              </div>

              <form className="fixed-add-form" onSubmit={adicionarConta}>
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
                <button className="primary-button" type="submit" disabled={salvandoConta}>
                  <Plus size={17} />
                  {salvandoConta ? "Adicionando..." : "Adicionar"}
                </button>
              </form>
            </section>

            <section className="panel fixed-list-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">CONTAS FIXAS</p>
                  <h2>{tituloMes(mes)}</h2>
                </div>
              </div>

              {loading ? (
                <div className="empty-state compact"><p>Carregando contas...</p></div>
              ) : contas.length === 0 ? (
                <div className="empty-state compact">
                  <h3>Nenhuma conta fixa cadastrada</h3>
                  <p>Adicione despesas que se repetem todos os meses.</p>
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
                <strong>{moeda(totalContas)}</strong>
              </div>
            </section>
          </div>

          <div className="expense-column">
            <section className="panel installment-add-panel">
              <div>
                <p className="eyebrow">CARTÃO</p>
                <h2>Adicionar parcelamento</h2>
                <p className="installment-help">
                  Informe qual parcela está sendo paga no mês selecionado. O sistema calcula os próximos meses sozinho.
                </p>
              </div>

              <form className="installment-form" onSubmit={adicionarParcela}>
                <input
                  className="installment-wide"
                  placeholder="Ex.: Pneus do caminhão"
                  value={descricaoParcela}
                  onChange={(e) => setDescricaoParcela(e.target.value)}
                />
                <input
                  placeholder="Cartão"
                  value={cartao}
                  onChange={(e) => setCartao(e.target.value)}
                />
                <input
                  placeholder="Valor da parcela"
                  inputMode="decimal"
                  value={valorParcela}
                  onChange={(e) => setValorParcela(e.target.value)}
                />
                <input
                  placeholder="Total de parcelas"
                  inputMode="numeric"
                  value={totalParcelas}
                  onChange={(e) => setTotalParcelas(e.target.value)}
                />
                <input
                  placeholder="Parcela atual"
                  inputMode="numeric"
                  value={parcelaAtual}
                  onChange={(e) => setParcelaAtual(e.target.value)}
                />
                <button className="primary-button" type="submit" disabled={salvandoParcela}>
                  <Plus size={17} />
                  {salvandoParcela ? "Adicionando..." : "Adicionar"}
                </button>
              </form>
            </section>

            <section className="panel fixed-list-panel installment-list-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">PARCELAS NO CARTÃO</p>
                  <h2>{tituloMes(mes)}</h2>
                </div>
                <CreditCard size={19} />
              </div>

              {loading ? (
                <div className="empty-state compact"><p>Carregando parcelas...</p></div>
              ) : parcelasDoMes.length === 0 ? (
                <div className="empty-state compact">
                  <h3>Nenhuma parcela neste mês</h3>
                  <p>Os parcelamentos ativos aparecerão automaticamente nos meses corretos.</p>
                </div>
              ) : (
                <div className="fixed-list">
                  {parcelasDoMes.map((item) => {
                    const pago = Boolean(parcelasMensais[item.id]?.pago);

                    return (
                      <button
                        className={"fixed-row installment-row " + (pago ? "done" : "")}
                        key={item.id}
                        type="button"
                        onClick={() => alternarParcelaPago(item.id)}
                      >
                        <span className="fixed-check">
                          {pago ? <CheckCircle2 size={23} /> : <Circle size={23} />}
                        </span>

                        <span className="fixed-name">
                          <strong>{item.descricao}</strong>
                          <small>
                            {item.numeroParcela}/{item.total_parcelas}
                            {item.cartao ? " • " + item.cartao : ""}
                            {" • "}
                            {item.faltam === 0
                              ? "última parcela"
                              : item.faltam === 1
                                ? "falta 1 parcela"
                                : "faltam " + item.faltam + " parcelas"}
                          </small>
                          <small className="installment-end">
                            Termina em {mesCurto(item.terminaEm)}
                          </small>
                        </span>

                        <strong className="fixed-value">
                          {moeda(Number(item.valor_parcela))}
                        </strong>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="fixed-total-row">
                <span>Total das parcelas no mês</span>
                <strong>{moeda(totalParcelasMes)}</strong>
              </div>
            </section>
          </div>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
