import { useNavigate, useParams } from 'react-router-dom'
import { useCreatePostDraft } from '@/contexts/CreatePostDraftContext'
import { userCreatePostPath } from '@/lib/routes'

export default function CreatePostStepRevisao() {
  const { userId = '' } = useParams()
  const navigate = useNavigate()
  const { draft, resetDraft } = useCreatePostDraft()

  const base = userCreatePostPath(userId)

  const visibilityLabel = draft.visibility === 'public' ? 'Público' : 'Só seguidores'

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pré-visualização</p>
        <h2 className="mt-2 font-display text-xl font-light text-foreground">
          {draft.title.trim() || '(sem título)'}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {draft.body.trim() || '(sem descrição)'}
        </p>
        {draft.imageUrl.trim() ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <img
              src={draft.imageUrl.trim()}
              alt=""
              className="max-h-48 w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        ) : null}
        <p className="mt-4 text-xs text-muted-foreground">Visibilidade: {visibilityLabel}</p>
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`${base}/media`)}
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:bg-muted/60"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => {
            resetDraft()
            navigate(`/user/${userId}`, { state: { createPostDemoDone: true } })
          }}
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98]"
        >
          Publicar (demo)
        </button>
      </div>
    </div>
  )
}
