import Link from "next/link";

export default function ViagensPage() {
  return (
    <main className="simple-page">
      <div className="page-header">
        <div>
          <Link className="back-link" href="/">← Voltar ao painel</Link>
          <p className="eyebrow">VIAGENS</p>
          <h1>Todos os fretes</h1>
          <p className="subtitle">Aqui ficarão todas as viagens, sem linhas vazias e com filtros simples.</p>
        </div>
        <Link className="primary-button" href="/viagens/nova">+ Nova viagem</Link>
      </div>

      <div className="filter-bar">
        <input placeholder="Buscar origem, destino ou empresa..." />
        <select defaultValue="todos">
          <option value="todos">Todos os status</option>
          <option value="andamento">Em viagem</option>
          <option value="saldo">Aguardando saldo</option>
          <option value="comissao">Comissão pendente</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      <section className="panel table-panel">
        <div className="empty-state">
          <h3>A lista está pronta para receber os dados</h3>
          <p>Na próxima etapa vamos ligar esta tela ao banco e importar as viagens existentes da planilha.</p>
          <Link className="secondary-button" href="/viagens/nova">Cadastrar uma viagem</Link>
        </div>
      </section>
    </main>
  );
}
