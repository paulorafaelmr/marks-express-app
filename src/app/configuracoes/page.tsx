import AppShell from "@/components/AppShell";

export default function ConfiguracoesPage() {
  return (
    <AppShell>
      <header className="page-topbar">
        <div>
          <p className="eyebrow">CONFIGURAÇÕES</p>
          <h1>Parâmetros dos fretes</h1>
          <p className="subtitle">
            Esses valores serão usados automaticamente nos cálculos das viagens.
          </p>
        </div>
      </header>

      <section className="panel form-panel">
        <div className="form-section">
          <h2>Parâmetros atuais</h2>

          <div className="form-grid">
            <label>
              Comissão do motorista
              <input defaultValue="13%" />
            </label>

            <label>
              Média do caminhão
              <input defaultValue="3,0 km/L" />
            </label>

            <label>
              Preço médio do diesel
              <input defaultValue="R$ 5,80" />
            </label>
          </div>
        </div>

        <div className="calculation-note">
          Alterando esses parâmetros, as próximas etapas do sistema vão recalcular
          comissão, diesel estimado e sobra das viagens automaticamente.
        </div>

        <div className="form-actions">
          <button className="primary-button" type="button">Salvar configurações</button>
        </div>
      </section>
    </AppShell>
  );
}
