import Link from "next/link";

export default function NovaViagemPage() {
  return (
    <main className="simple-page narrow">
      <div className="page-header">
        <div>
          <Link className="back-link" href="/viagens">← Voltar para viagens</Link>
          <p className="eyebrow">CADASTRO</p>
          <h1>Nova viagem</h1>
          <p className="subtitle">Preencha apenas o que você realmente precisa acompanhar no dia a dia.</p>
        </div>
      </div>

      <section className="panel form-panel">
        <div className="form-section">
          <h2>Informações da viagem</h2>
          <div className="form-grid">
            <label>Data<input type="date" /></label>
            <label>Empresa ou agenciador<input placeholder="Ex.: Transportadora X" /></label>
            <label>Origem<input placeholder="Cidade de origem" /></label>
            <label>Destino<input placeholder="Cidade de destino" /></label>
          </div>
        </div>

        <div className="form-section">
          <h2>Valores</h2>
          <div className="form-grid">
            <label>Valor do frete<input inputMode="decimal" placeholder="R$ 0,00" /></label>
            <label>Adiantamento<input inputMode="decimal" placeholder="R$ 0,00" /></label>
            <label>Pedágio<input inputMode="decimal" placeholder="R$ 0,00" /></label>
            <label>Comissão<input inputMode="decimal" placeholder="R$ 0,00" /></label>
          </div>
        </div>

        <div className="form-section">
          <h2>Operação</h2>
          <div className="form-grid">
            <label>KM aproximados<input inputMode="numeric" placeholder="0 km" /></label>
            <label>Diesel / despesas da viagem<input inputMode="decimal" placeholder="R$ 0,00" /></label>
            <label className="full">Observações<textarea rows={4} placeholder="Alguma informação importante sobre esta viagem..." /></label>
          </div>
        </div>

        <div className="form-actions">
          <Link className="ghost-button" href="/viagens">Cancelar</Link>
          <button className="primary-button" type="button">Salvar viagem</button>
        </div>

        <p className="form-note">O botão de salvar será conectado ao banco de dados na próxima etapa.</p>
      </section>
    </main>
  );
}
