import { useNavigate } from 'react-router-dom'
import { useCreatePostDraft } from '@/contexts/CreatePostDraftContext'
import { createPostPath } from '@/lib/routes'

export default function CreatePostStepConteudo() {
  const navigate = useNavigate()
  const { draft, patchDraft } = useCreatePostDraft()

  const base = createPostPath()

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="create-content" className="text-sm font-medium text-foreground">
          O que queres partilhar?
        </label>
        <textarea
          id="create-content"
          value={draft.content}
          onChange={(e) => patchDraft({ content: e.target.value })}
          placeholder="Escreve o texto da tua postagem…"
          rows={8}
          className="mt-2 w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(`${base}/media`)}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
        >
          Seguinte: mídia
        </button>
      </div>
    </div>
  )
}
