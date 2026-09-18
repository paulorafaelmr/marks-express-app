"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type Documento = {
  id: string;
  nome: string;
  arquivo_path: string;
  arquivo_nome_original: string;
  mime_type: string | null;
  tamanho_bytes: number | null;
  created_at: string;
};

function tamanhoArquivo(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",") + " MB";
}

function extensao(nome: string) {
  const partes = nome.split(".");
  return partes.length > 1 ? partes.at(-1)?.toUpperCase() : "ARQUIVO";
}

function nomeSeguro(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

export default function DocumentosPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [acaoId, setAcaoId] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    setLoading(true);
    setErro("");

    const { data, error } = await supabase
      .from("documentos")
      .select("*");

    if (error) {
      setErro("Não foi possível carregar os documentos.");
    } else {
      setDocumentos((data ?? []) as Documento[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  const ordenados = useMemo(
    () =>
      [...documentos].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
      ),
    [documentos]
  );

  async function adicionar(event: FormEvent) {
    event.preventDefault();
    setErro("");

    if (!nome.trim() || !arquivo) {
      setErro("Informe o nome do documento e selecione um arquivo.");
      return;
    }

    if (arquivo.size > 20 * 1024 * 1024) {
      setErro("O arquivo deve ter no máximo 20 MB.");
      return;
    }

    setSalvando(true);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setErro("Sua sessão expirou. Entre novamente.");
      setSalvando(false);
      return;
    }

    const path =
      user.id +
      "/" +
      crypto.randomUUID() +
      "-" +
      nomeSeguro(arquivo.name);

    const { error: uploadError } = await supabase.storage
      .from("documentos")
      .upload(path, arquivo, {
        contentType: arquivo.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      setErro("Não foi possível enviar o arquivo.");
      setSalvando(false);
      return;
    }

    const { error: insertError } = await supabase.from("documentos").insert({
      user_id: user.id,
      nome: nome.trim(),
      arquivo_path: path,
      arquivo_nome_original: arquivo.name,
      mime_type: arquivo.type || null,
      tamanho_bytes: arquivo.size,
    });

    if (insertError) {
      await supabase.storage.from("documentos").remove([path]);
      setErro("O arquivo foi enviado, mas não foi possível salvar o documento.");
      setSalvando(false);
      return;
    }

    setNome("");
    setArquivo(null);
    if (fileRef.current) fileRef.current.value = "";
    setMostrarForm(false);
    await carregar();
    setSalvando(false);
  }

  async function abrir(documento: Documento) {
    setAcaoId(documento.id);
    setErro("");

    const { data, error } = await supabase.storage
      .from("documentos")
      .createSignedUrl(documento.arquivo_path, 120);

    if (error || !data?.signedUrl) {
      setErro("Não foi possível abrir o documento.");
    } else {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }

    setAcaoId("");
  }

  async function baixar(documento: Documento) {
    setAcaoId(documento.id);
    setErro("");

    const { data, error } = await supabase.storage
      .from("documentos")
      .download(documento.arquivo_path);

    if (error || !data) {
      setErro("Não foi possível baixar o documento.");
      setAcaoId("");
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = documento.arquivo_nome_original;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setAcaoId("");
  }

  async function excluir(documento: Documento) {
    if (!window.confirm('Excluir "' + documento.nome + '"?')) return;

    setAcaoId(documento.id);
    setErro("");

    const { error: storageError } = await supabase.storage
      .from("documentos")
      .remove([documento.arquivo_path]);

    if (storageError) {
      setErro("Não foi possível excluir o arquivo.");
      setAcaoId("");
      return;
    }

    const { error } = await supabase
      .from("documentos")
      .delete()
      .eq("id", documento.id);

    if (error) {
      setErro("O arquivo foi removido, mas não foi possível atualizar a lista.");
    } else {
      setDocumentos((prev) => prev.filter((item) => item.id !== documento.id));
    }

    setAcaoId("");
  }

  return (
    <AuthGuard>
      <AppShell>
        <header className="page-topbar documents-topbar">
          <div>
            <p className="eyebrow">DOCUMENTOS</p>
            <h1>Arquivos da empresa</h1>
            <p className="subtitle">
              Todos os documentos importantes em um só lugar.
            </p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => setMostrarForm((atual) => !atual)}
          >
            {mostrarForm ? <X size={18} /> : <Plus size={18} />}
            {mostrarForm ? "Fechar" : "Adicionar documento"}
          </button>
        </header>

        {erro && <div className="notice error-notice">{erro}</div>}

        {mostrarForm && (
          <section className="panel document-upload-panel">
            <div className="document-upload-copy">
              <div className="document-upload-icon"><Upload size={21} /></div>
              <div>
                <h2>Novo documento</h2>
                <p>Dê um nome simples e selecione o arquivo.</p>
              </div>
            </div>

            <form className="document-upload-form" onSubmit={adicionar}>
              <label className="field-block field-grow">
                <span>Nome do documento</span>
                <input
                  placeholder="Ex.: Cartão CNPJ"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </label>

              <label className="field-block field-grow">
                <span>Arquivo</span>
                <input
                  ref={fileRef}
                  type="file"
                  onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                />
              </label>

              <button className="primary-button" type="submit" disabled={salvando}>
                <Upload size={17} />
                {salvando ? "Enviando..." : "Salvar documento"}
              </button>
            </form>
          </section>
        )}

        <section className="panel documents-panel">
          <div className="documents-heading">
            <div>
              <p className="eyebrow">ARQUIVOS</p>
              <h2>Documentos</h2>
            </div>
            <span className="documents-count">
              {ordenados.length} {ordenados.length === 1 ? "documento" : "documentos"}
            </span>
          </div>

          {loading ? (
            <div className="empty-state compact"><p>Carregando documentos...</p></div>
          ) : ordenados.length === 0 ? (
            <div className="empty-state compact documents-empty">
              <div className="empty-icon"><FileText size={23} /></div>
              <h3>Nenhum documento adicionado</h3>
              <p>Use o botão acima para enviar o primeiro arquivo.</p>
            </div>
          ) : (
            <div className="documents-list">
              {ordenados.map((documento) => (
                <article className="document-row" key={documento.id}>
                  <div className="document-file-icon">
                    <FileText size={20} />
                  </div>

                  <div className="document-main">
                    <strong>{documento.nome}</strong>
                    <small>
                      {extensao(documento.arquivo_nome_original)}
                      {documento.tamanho_bytes
                        ? " · " + tamanhoArquivo(documento.tamanho_bytes)
                        : ""}
                    </small>
                  </div>

                  <div className="document-actions">
                    <button
                      type="button"
                      className="document-action"
                      disabled={acaoId === documento.id}
                      onClick={() => abrir(documento)}
                    >
                      <ExternalLink size={16} />
                      Abrir
                    </button>

                    <button
                      type="button"
                      className="document-action"
                      disabled={acaoId === documento.id}
                      onClick={() => baixar(documento)}
                    >
                      <Download size={16} />
                      Baixar
                    </button>

                    <button
                      type="button"
                      className="document-action danger"
                      disabled={acaoId === documento.id}
                      onClick={() => excluir(documento)}
                      aria-label={"Excluir " + documento.nome}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </AppShell>
    </AuthGuard>
  );
}
