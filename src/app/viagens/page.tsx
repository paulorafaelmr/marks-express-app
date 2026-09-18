import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function ViagensPage() {
  return (
    <AppShell>
      <header className="page-topbar">
        <div>
          <p className="eyebrow">FRETES</p>
          <h1>Viagens</h1>
          <p className="subtitle">Uma linha por viagem, com leitura rápida e simples.</p>
        </div>
        <Link className="primary-button" href="/viagens/nova">+ Nova viagem</Link>
      </header>

      <section className="freight-toolbar">
        <input placeholder="Buscar empresa, origem ou destino..." />
        <select defaultValue="todos">
          <option value="todos">Todos os status</option>
          <option value="viagem">Em viagem</option>
          <option value="saldo">Aguardando saldo</option>
          <option value="comissao">Comissão pendente</option>
          <option value="finalizado">Finalizado</option>
        </select>
        <input type="month" defaultValue="2026-09" />
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

        <div className="empty-state">
          <h3>Nenhum frete cadastrado</h3>
          <p>As viagens vão aparecer aqui com valores e status automáticos.</p>
          <Link className="secondary-button" href="/viagens/nova">Cadastrar viagem</Link>
        </div>
      </section>
    </AppShell>
  );
}
