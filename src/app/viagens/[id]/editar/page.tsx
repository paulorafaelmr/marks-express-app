"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import type { Frete, TipoPedagio } from "@/lib/types";

function formatInput(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value).replace(".", ",");
}

function numero(value: string) {
  const normalizado = value
    .replace(/R\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalizado);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function EditarViagemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [frete, setFrete] = useState<Frete | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("fretes")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setErro("Não foi possível carregar esta viagem.");
      } else {
        setFrete(data as Frete);
      }

      setLoading(false);
    }

    carregar();
  }, [params.id]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!frete) return;

    setSalvando(true);
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
      setSalvando(false);
      return;
    }

    const { error } = await supabase
      .from("fretes")
      .update(payload)
      .eq("id", frete.id);

    if (error) {
      setErro("Não foi possível salvar as alterações.");
      setSalvando(false);
      return;
    }

    router.push("/viagens/" + frete.id);
  }

  return (
    <AuthGuard>
      <AppShell>
        {loading ? (
          <div className="empty-state"><p>Carregando viagem...</p></div>
        ) : !frete ? (
          <div className="empty-state">
            <h3>Viagem não encontrada</h3>
            <p>{erro || "Esse frete não está disponível."}</p>
            <Link className="secondary-button" href="/viagens">Voltar para fretes</Link>
          </div>
        ) : (
          <>
            <header className="page-topbar">
              <div>
                <Link className="back-link" href={"/viagens/" + frete.id}>← Voltar para a viagem</Link>
                <p className="eyebrow">EDITAR FRETE</p>
                <h1>{frete.origem} → {frete.destino}</h1>
                <p className="subtitle">Altere os dados principais da viagem sem mexer no andamento já registrado.</p>
              </div>
            </header>

            <form className="panel form-panel" onSubmit={salvar}>
              <div className="form-section">
                <h2>Viagem</h2>
                <div className="form-grid">
                  <label>Data<input name="data" type="date" required defaultValue={frete.data} /></label>
                  <label>Empresa ou agenciador<input name="empresa_agenciador" defaultValue={frete.empresa_agenciador || ""} /></label>
                  <label>Origem<input name="origem" required defaultValue={frete.origem} /></label>
                  <label>Destino<input name="destino" required defaultValue={frete.destino} /></label>
                </div>
              </div>

              <div className="form-section">
                <h2>Frete e recebimento</h2>
                <div className="form-grid">
                  <label>Valor do frete<input name="valor_frete" required inputMode="decimal" defaultValue={formatInput(frete.valor_frete)} /></label>
                  <label>Adiantamento<input name="valor_adiantamento" inputMode="decimal" defaultValue={formatInput(frete.valor_adiantamento)} /></label>
                  <label>
                    Tipo de pedágio
                    <select name="tipo_pedagio" defaultValue={frete.tipo_pedagio}>
                      <option value="na_tag">Na tag</option>
                      <option value="incluso_frete">Incluso no frete</option>
                      <option value="pago_marks">Pago pela Marks</option>
                    </select>
                  </label>
                  <label>Valor do pedágio<input name="valor_pedagio" inputMode="decimal" defaultValue={formatInput(frete.valor_pedagio)} /></label>
                </div>
              </div>

              <div className="form-section">
                <h2>Operação</h2>
                <div className="form-grid">
                  <label>KM aproximados<input name="km_aproximados" inputMode="decimal" defaultValue={formatInput(frete.km_aproximados)} /></label>
                  <label>Outras despesas<input name="outras_despesas" inputMode="decimal" defaultValue={formatInput(frete.outras_despesas)} /></label>
                  <label className="full">
                    Observações
                    <textarea name="observacoes" rows={4} defaultValue={frete.observacoes || ""} />
                  </label>
                </div>
              </div>

              {erro && <div className="notice error-notice">{erro}</div>}

              <div className="form-actions">
                <Link className="ghost-button" href={"/viagens/" + frete.id}>Cancelar</Link>
                <button className="primary-button" type="submit" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </>
        )}
      </AppShell>
    </AuthGuard>
  );
}
