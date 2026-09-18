import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function NovaViagemPage() {
  return (
    <AppShell>
      <header className="page-topbar">
        <div>
          <Link className="back-link" href="/viagens">← Voltar para fretes</Link>
          <p className="eyebrow">NOVA VIAGEM</p>
          <h1>Cadastrar frete</h1>
          <p className="subtitle">
            Informe só o necessário. Comissão e diesel serão calculados automaticamente.
          </p>
        </div>
      </header>

      <section className="panel form-panel">
        <div className="form-section">
          <h2>Viagem</h2>
          <div className="form-grid">
            <label>Data<input type="date" /></label>
            <label>Empresa ou agenciador<input placeholder="Ex.: Transportadora X" /></label>
            <label>Origem<input placeholder="Cidade de origem" /></label>
            <label>Destino<input placeholder="Cidade de destino" /></label>
          </div>
        </div>

        <div className="form-section">
          <h2>Frete e recebimento</h2>
          <div className="form-grid">
            <label>Valor do frete<input inputMode="decimal" placeholder="R$ 0,00" /></label>
            <label>Adiantamento<input inputMode="decimal" placeholder="R$ 0,00" /></label>
            <label>
              Tipo de pedágio
              <select defaultValue="na_tag">
                <option value="na_tag">Na tag</option>
                <option value="incluso_frete">Incluso no frete</option>
                <option value="pago_marks">Pago pela Marks</option>
              </select>
            </label>
            <label>Valor do pedágio<input inputMode="decimal" placeholder="R$ 0,00" /></label>
          </div>
        </div>

        <div className="form-section">
          <h2>Operação</h2>
          <div className="form-grid">
            <label>KM aproximados<input inputMode="numeric" placeholder="0 km" /></label>
            <label>Outras despesas<input inputMode="decimal" placeholder="R$ 0,00" /></label>
            <label className="full">
              Observações
              <textarea rows={4} placeholder="Informações importantes sobre a viagem..." />
            </label>
          </div>
        </div>

        <div className="calculation-note">
          <strong>Automático:</strong> comissão do motorista, diesel estimado, saldo,
          comissão pendente, sobra estimada e status da viagem.
        </div>

        <div className="form-actions">
          <Link className="ghost-button" href="/viagens">Cancelar</Link>
          <button className="primary-button" type="button">Salvar viagem</button>
        </div>
      </section>
    </AppShell>
  );
}
