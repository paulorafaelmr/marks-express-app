import type { StatusFrete } from "@/lib/types";

const classes: Record<StatusFrete, string> = {
  "Aguardando adiantamento": "status-aguardando-adiantamento",
  "Em viagem": "status-em-viagem",
  "Aguardando saldo": "status-aguardando-saldo",
  "Comissão pendente": "status-comissao-pendente",
  "Finalizado": "status-finalizado",
};

export default function StatusBadge({ status }: { status: StatusFrete }) {
  return <span className={"status-badge " + classes[status]}>{status}</span>;
}
