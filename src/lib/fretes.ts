import type {
  ConfiguracoesFrete,
  Frete,
  StatusFrete,
} from "./types";

const n = (value: number | string | null | undefined) => Number(value ?? 0);

export function calcularFrete(
  frete: Frete,
  config: ConfiguracoesFrete
) {
  const valorFrete = n(frete.valor_frete);
  const adiantamento = n(frete.valor_adiantamento);
  const pedagio = n(frete.valor_pedagio);
  const outrasDespesas = n(frete.outras_despesas);
  const km = n(frete.km_aproximados);

  const comissaoPercentual = n(config.comissao_motorista);
  const mediaKmL = Math.max(n(config.media_caminhao_km_l), 0.001);
  const dieselLitro = n(config.preco_medio_diesel);

  const pedagioDescontado =
    frete.tipo_pedagio === "na_tag" ? 0 : pedagio;

  const saldoFrete = Math.max(
    valorFrete - adiantamento - pedagioDescontado,
    0
  );

  const comissaoAdiantamento = adiantamento * comissaoPercentual;
  const comissaoTotal = valorFrete * comissaoPercentual;
  const comissaoSaldo = Math.max(
    comissaoTotal - comissaoAdiantamento,
    0
  );

  const dieselEstimado = km > 0 ? (km / mediaKmL) * dieselLitro : 0;

  const comissaoPendente =
    (frete.adiantamento_recebido &&
    !frete.comissao_adiantamento_paga &&
    adiantamento > 0
      ? comissaoAdiantamento
      : 0) +
    (frete.saldo_recebido && !frete.comissao_saldo_paga
      ? comissaoSaldo
      : 0);

  const aReceber =
    (!frete.adiantamento_recebido ? adiantamento : 0) +
    (!frete.saldo_recebido ? saldoFrete : 0);

  const sobraEstimada =
    valorFrete -
    comissaoTotal -
    dieselEstimado -
    outrasDespesas -
    pedagioDescontado;

  let status: StatusFrete;

  if (adiantamento > 0 && !frete.adiantamento_recebido) {
    status = "Aguardando adiantamento";
  } else if (!frete.carga_entregue) {
    status = "Em viagem";
  } else if (saldoFrete > 0 && !frete.saldo_recebido) {
    status = "Aguardando saldo";
  } else if (comissaoPendente > 0) {
    status = "Comissão pendente";
  } else {
    status = "Finalizado";
  }

  return {
    valorFrete,
    adiantamento,
    pedagio,
    pedagioDescontado,
    saldoFrete,
    comissaoAdiantamento,
    comissaoSaldo,
    comissaoTotal,
    dieselEstimado,
    outrasDespesas,
    comissaoPendente,
    aReceber,
    sobraEstimada,
    status,
  };
}

export function moeda(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function dataBr(value: string) {
  const [ano, mes, dia] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(ano, mes - 1, dia)
  );
}

export function mesAtualInput() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function estaNoMes(data: string, mes: string) {
  return data.startsWith(mes);
}
