export type TipoPedagio = "na_tag" | "incluso_frete" | "pago_marks";

export type ConfiguracoesFrete = {
  id: number;
  comissao_motorista: number | string;
  media_caminhao_km_l: number | string;
  preco_medio_diesel: number | string;
  updated_at?: string;
};

export type Frete = {
  id: string;
  data: string;
  empresa_agenciador: string | null;
  origem: string;
  destino: string;
  valor_frete: number | string;
  tipo_pedagio: TipoPedagio;
  valor_pedagio: number | string;
  valor_adiantamento: number | string;
  adiantamento_recebido: boolean;
  comissao_adiantamento_paga: boolean;
  carga_entregue: boolean;
  saldo_recebido: boolean;
  comissao_saldo_paga: boolean;
  km_aproximados: number | string | null;
  outras_despesas: number | string;
  observacoes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type StatusFrete =
  | "Aguardando adiantamento"
  | "Em viagem"
  | "Aguardando saldo"
  | "Comissão pendente"
  | "Finalizado";
