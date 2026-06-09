import { useState } from "react"

function IntegrationCard({ icon, name, status, statusColor, description, action, actionLabel }) {
  const colors = {
    green:  "bg-green-900/40 text-green-400 border-green-800",
    yellow: "bg-yellow-900/40 text-yellow-400 border-yellow-800",
    zinc:   "bg-zinc-800 text-zinc-400 border-zinc-700",
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
      <div className="text-3xl shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white font-semibold">{name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors[statusColor]}`}>{status}</span>
        </div>
        <p className="text-zinc-500 text-xs">{description}</p>
      </div>
      {action && (
        <button onClick={action}
          className="shrink-0 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default function Settings({ adminKey, onAdminKeyChange }) {
  const [consultor, setConsultor] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ll_consultor") || "{}") } catch { return {} }
  })
  const [saved, setSaved] = useState(false)

  function saveConsultor() {
    localStorage.setItem("ll_consultor", JSON.stringify(consultor))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const input = (k, props = {}) => (
    <input
      value={consultor[k] || ""}
      onChange={e => setConsultor(c => ({ ...c, [k]: e.target.value }))}
      className="w-full bg-zinc-800 text-white rounded-xl px-4 py-2.5 border border-zinc-700 focus:outline-none focus:border-amber-500 transition text-sm placeholder-zinc-600"
      {...props}
    />
  )

  return (
    <div className="p-6 space-y-8 max-w-2xl">

      {/* Consultor */}
      <section>
        <h3 className="text-white font-bold text-base mb-1">Consultor Padrão</h3>
        <p className="text-zinc-500 text-sm mb-4">Aparece no botão "Falar com consultor" da landing page</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Nome</label>
            {input("nome", { placeholder: "Gustavo Ferreira" })}
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-1.5">WhatsApp (com DDI)</label>
            {input("whatsapp", { placeholder: "5561999990000" })}
            <p className="text-zinc-600 text-xs mt-1">Defina também o env var CONSULTOR_PHONE no Vercel para persistir após redeploy</p>
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-1.5">E-mail</label>
            {input("email", { placeholder: "gustavo@empresa.com" })}
          </div>
          <button onClick={saveConsultor}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition">
            {saved ? "✓ Salvo!" : "Salvar"}
          </button>
        </div>
      </section>

      {/* Integrações */}
      <section>
        <h3 className="text-white font-bold text-base mb-1">Integrações</h3>
        <p className="text-zinc-500 text-sm mb-4">Canais de comunicação e automação</p>
        <div className="space-y-3">
          <IntegrationCard
            icon="💬" name="WhatsApp (UAZAPI)"
            status="Conectado" statusColor="green"
            description="Mensagem automática disparada no cadastro de cada lead. Instância: btechsoutoshop.uazapi.com" />
          <IntegrationCard
            icon="✉️" name="E-mail Marketing"
            status="Não configurado" statusColor="zinc"
            description="Envio de e-mails automáticos para nutrição de leads (Mailgun / SendGrid)"
            action={() => alert("Em breve: integração com Mailgun ou SendGrid")}
            actionLabel="Configurar" />
          <IntegrationCard
            icon="📅" name="Google Calendar"
            status="Não configurado" statusColor="zinc"
            description="Agendar visitas ao terreno e reuniões com interessados automaticamente"
            action={() => alert("Em breve: integração com Google Calendar")}
            actionLabel="Conectar" />
          <IntegrationCard
            icon="🤖" name="Automação n8n"
            status="Disponível" statusColor="yellow"
            description={`Follow-ups automáticos via n8n em https://n8n.btechsouto.shop`}
            action={() => window.open("https://n8n.btechsouto.shop", "_blank")}
            actionLabel="Abrir n8n" />
          <IntegrationCard
            icon="📊" name="Google Analytics / Meta Pixel"
            status="Não configurado" statusColor="zinc"
            description="Rastrear conversões de leads por campanha de anúncios"
            action={() => alert("Adicione o ID do pixel no env var VITE_PIXEL_ID")}
            actionLabel="Configurar" />
        </div>
      </section>

      {/* Acesso */}
      <section>
        <h3 className="text-white font-bold text-base mb-1">Segurança</h3>
        <p className="text-zinc-500 text-sm mb-4">Acesso ao painel admin</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-0.5">Chave de Acesso (ADMIN_KEY)</div>
              <div className="text-zinc-500 text-sm">Para trocar, atualize o env var ADMIN_KEY no Vercel e redeploy</div>
            </div>
            <button onClick={() => window.open("https://vercel.com/bruno-soutos-projects/leilao-leads/settings/environment-variables", "_blank")}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition shrink-0">
              Vercel →
            </button>
          </div>
          <div className="border-t border-zinc-800 pt-3">
            <button onClick={() => { localStorage.removeItem("ll_ak"); window.location.reload() }}
              className="text-red-400 hover:text-red-300 text-sm transition">
              Encerrar sessão
            </button>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section>
        <h3 className="text-white font-bold text-base mb-1">Sobre o Sistema</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm text-zinc-400 space-y-1">
          <div>Plataforma: <span className="text-white">Leilão Leads CRM</span></div>
          <div>Stack: <span className="text-white">React + Express + Supabase + UAZAPI</span></div>
          <div>Deploy: <span className="text-white">Vercel (leilao-leads.vercel.app)</span></div>
          <div>Desenvolvido por: <span className="text-amber-400">BTechSouto</span></div>
          <div className="pt-2 flex gap-3">
            <a href="/?lot=demo" target="_blank" className="text-amber-400 hover:underline text-xs">Ver LP demo ↗</a>
            <a href="https://github.com/Bsouto319/leilao-leads" target="_blank" className="text-zinc-500 hover:text-zinc-300 text-xs">GitHub ↗</a>
          </div>
        </div>
      </section>
    </div>
  )
}
