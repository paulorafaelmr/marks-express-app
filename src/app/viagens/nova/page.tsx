"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import type { TipoPedagio } from "@/lib/types";

function numero(value: string) {
  const normalizado = value
    .replace(/R\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalizado);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function NovaViagemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErro("");

    const form = new FormData(event.currentTarget);

    const payload = {
      data: String(form.get("data") || ""),
      empresa_agenciador: String(form.get("empresa_agenciador") || "").trim() || null,
      origem: String(form.get("origem") || "").trim(),
      destino: String(form.get("destino") || "").trim(),
      valor_frete: numero(String(form.get("valor_frete") || "0")),
      valor_adiantamento: numero(String(form.get("valor_adiantamento") || "0")),
      tipo_pedagio: String(form.get("tipo_pedagio") || "na_tag") as TipoPedagio,
      valor_pedagio: numero(String(form.get("valor_pedagio") || "0")),
      km_aproximados: numero(String(form.get("km_aproximados") || "0")) || null,
      outras_despesas: numero(String(form.get("outras_despesas") || "0")),
      observacoes: String(form.get("observacoes") || "").trim() || null,
    };

    if (!payload.data || !payload.origem || !payload.destino || payload.valor_frete <= 0) {
      setErro("Preencha data, origem, destino e valor do frete.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("fretes")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      setErro("Não foi possível salvar a viagem. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/viagens/" + data.id);
  }

  return (
    <AuthGuard>
      <AppShell>
        <header className="page-topbar">
          <div>
            <Link className="back-link" href="/viagens">← Voltar para fretes</Link>
            <p className="eyebrow">NOVA VIAGEM</p>
            <h1>Cadastrar frete</h1>
            <p className="subtitle">
              Comissão, diesel, saldo e sobra serão calculados automaticamente.
            </p>
          </div>
        </header>

        <form className="panel form-panel" onSubmit={salvar}>
          <div className="form-section">
            <h2>Viagem</h2>
            <div className="form-grid">
              <label>Data<input name="data" type="date" required /></label>
              <label>Empresa ou agenciador<input name="empresa_agenciador" placeholder="Ex.: Transportadora X" /></label>
              <label>Origem<input name="origem" required placeholder="Cidade de origem" /></label>
              <label>Destino<input name="destino" required placeholder="Cidade de destino" /></label>
            </div>
          </div>

          <div className="form-section">
            <h2>Frete e recebimento</h2>
            <div className="form-grid">
              <label>Valor do frete<input name="valor_frete" required inputMode="decimal" placeholder="R$ 0,00" /></label>
              <label>Adiantamento<input name="valor_adiantamento" inputMode="decimal" placeholder="R$ 0,00" /></label>
              <label>
                Tipo de pedágio
                <select name="tipo_pedagio" defaultValue="na_tag">
                  <option value="na_tag">Na tag</option>
                  <option value="incluso_frete">Incluso no frete</option>
                  <option value="pago_marks">Pago pela Marks</option>
                </select>
              </label>
              <label>Valor do pedágio<input name="valor_pedagio" inputMode="decimal" placeholder="R$ 0,00" /></label>
            </div>
          </div>

          <div className="form-section">
            <h2>Operação</h2>
            <div className="form-grid">
              <label>KM aproximados<input name="km_aproximados" inputMode="decimal" placeholder="0 km" /></label>
              <label>Outras despesas<input name="outras_despesas" inputMode="decimal" placeholder="R$ 0,00" /></label>
              <label className="full">
                Observações
                <textarea name="observacoes" rows={4} placeholder="Informações importantes sobre a viagem..." />
              </label>
            </div>
          </div>

          <div className="calculation-note">
            <strong>Automático:</strong> comissão do motorista, diesel estimado,
            saldo, comissão pendente, sobra estimada e status.
          </div>

          {erro && <div className="notice error-notice">{erro}</div>}

          <div className="form-actions">
            <Link className="ghost-button" href="/viagens">Cancelar</Link>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar viagem"}
            </button>
          </div>
        </form>
      </AppShell>
    </AuthGuard>
  );
}
