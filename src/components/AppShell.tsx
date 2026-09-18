"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gauge, LogOut, Plus, ReceiptText, Settings, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";

const nav = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/viagens", label: "Fretes", icon: Truck },
  { href: "/contas-fixas", label: "Contas fixas", icon: ReceiptText },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>Marks Express</strong>
            <span>Gestão de fretes</span>
          </div>
        </div>

        <nav className="nav">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                className={"nav-item " + (active ? "active" : "")}
                href={href}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <Link className="sidebar-new" href="/viagens/nova">
          <Plus size={18} />
          Nova viagem
        </Link>

        <button className="sidebar-logout" type="button" onClick={sair}>
          <LogOut size={17} />
          Sair
        </button>
      </aside>

      <section className="content">{children}</section>
    </main>
  );
}
