"use client";

import Link from "next/link";
import { Fuel, Plus, ReceiptText, Settings2, Truck } from "lucide-react";
import AppShell from "@/components/AppShell";

const resumo = [
  { label: "Faturamento", valor: "R$ 0,00", detalhe: "0 viagens no mês" },
  { label: "Sobra estimada", valor: "R$ 0,00", detalhe: "Após custos da viagem" },
  { label: "A receber", valor: "R$ 0,00", detalhe: "Adiantamentos e saldos" },
  { label: "Comissão pendente", valor: "R$ 0,00", detalhe: "Motorista" },
  { label: "Diesel estimado", valor: "R$ 0,00", detalhe: "Com base nos KM" },
];

export default function Dashboard() {
  return (
    <AppShell>
      <header className="page-topbar">
        <div>
          <p className="eyebrow">VISÃO GERAL</p>
          <h1>Dashboard</h1>
          <p className="subtitle">
            Tudo o que importa sobre os fretes, sem precisar procurar em dezenas de colunas.
          </p>
        </div>

        <div className="topbar-actions">
          <input className="month-input" type="month" defaultValue="2026-09" />
          <Link className="primary-button" href="/viagens/nova">
            <Plus size={18} />
            Nova viagem
          </Link>
        </div>
      </header>

      <section className="metrics-grid metrics-five">
        {resumo.map((item) => (
          <article className="metric-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.valor}</strong>
            <small>{item.detalhe}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel panel-large">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ACOMPANHAMENTO</p>
              <h2>Viagens que precisam de atenção</h2>
            </div>
            <Link href="/viagens">Ver todos os fretes</Link>
          </div>

          <div className="empty-state compact">
            <div className="empty-icon">
              <Truck size={23} />
            </div>
            <h3>Nenhuma viagem cadastrada</h3>
            <p>
              Assim que cadastrarmos ou importarmos os fretes, as viagens em andamento
              e pendências aparecerão aqui automaticamente.
            </p>
            <Link className="secondary-button" href="/viagens/nova">
              Cadastrar primeira viagem
            </Link>
          </div>
        </article>

        <div className="dashboard-side">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">PARÂMETROS</p>
                <h2>Configuração atual</h2>
              </div>
              <Link className="icon-link" href="/configuracoes">
                <Settings2 size={17} />
              </Link>
            </div>

            <div className="parameter-list">
              <div>
                <span>Comissão do motorista</span>
                <strong>13%</strong>
              </div>
              <div>
                <span>Média do caminhão</span>
                <strong>3,0 km/L</strong>
              </div>
              <div>
                <span>Diesel médio</span>
                <strong>R$ 5,80/L</strong>
              </div>
            </div>
          </article>

          <article className="panel quick-info">
            <div className="quick-info-icon">
              <Fuel size={20} />
            </div>
            <div>
              <span>Cálculo automático</span>
              <strong>Diesel estimado</strong>
              <p>KM da viagem ÷ média do caminhão × preço médio do diesel.</p>
            </div>
          </article>

          <article className="panel quick-info">
            <div className="quick-info-icon">
              <ReceiptText size={20} />
            </div>
            <div>
              <span>Resultado da viagem</span>
              <strong>Sobra estimada</strong>
              <p>Frete menos comissão, diesel, despesas e pedágio descontável.</p>
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
