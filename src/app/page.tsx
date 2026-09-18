import Link from "next/link";

const metrics = [
  { label: "Faturamento do mês", value: "R$ 0,00", detail: "0 viagens" },
  { label: "Resultado estimado", value: "R$ 0,00", detail: "Após despesas" },
  { label: "A receber", value: "R$ 0,00", detail: "Nenhum saldo pendente" },
  { label: "Despesas", value: "R$ 0,00", detail: "No mês atual" },
];

export default function Dashboard() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>Marks Express</strong>
            <span>Gestão de viagens</span>
          </div>
        </div>

        <nav className="nav">
          <Link className="nav-item active" href="/">Visão geral</Link>
          <Link className="nav-item" href="/viagens">Viagens</Link>
          <Link className="nav-item" href="/viagens/nova">Nova viagem</Link>
          <span className="nav-item muted">Despesas</span>
          <span className="nav-item muted">Financeiro</span>
        </nav>

        <div className="sidebar-footer">
          <span>Versão inicial</span>
          <small>Estrutura em desenvolvimento</small>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">SETEMBRO DE 2026</p>
            <h1>Visão geral</h1>
            <p className="subtitle">Tudo o que importa sobre as viagens em uma única tela.</p>
          </div>
          <Link className="primary-button" href="/viagens/nova">+ Nova viagem</Link>
        </header>

        <section className="metrics-grid">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="panel panel-large">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">ACOMPANHAMENTO</p>
                <h2>Viagens recentes</h2>
              </div>
              <Link href="/viagens">Ver todas</Link>
            </div>

            <div className="empty-state">
              <div className="empty-icon">+</div>
              <h3>Nenhuma viagem cadastrada</h3>
              <p>Quando cadastrarmos os fretes, eles aparecerão aqui automaticamente.</p>
              <Link className="secondary-button" href="/viagens/nova">Cadastrar primeira viagem</Link>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">PENDÊNCIAS</p>
                <h2>O que precisa de atenção</h2>
              </div>
            </div>

            <div className="attention-list">
              <div>
                <span className="status-dot green" />
                <p><strong>0</strong> saldos a receber</p>
              </div>
              <div>
                <span className="status-dot amber" />
                <p><strong>0</strong> comissões pendentes</p>
              </div>
              <div>
                <span className="status-dot gray" />
                <p><strong>0</strong> contas vencidas</p>
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
