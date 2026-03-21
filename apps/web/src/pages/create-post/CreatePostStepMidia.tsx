import { useNavigate, useParams } from 'react-router-dom'
import { useCreatePostDraft } from '@/contexts/CreatePostDraftContext'
import { userCreatePostPath } from '@/lib/routes'

export default function CreatePostStepMidia() {
  const { userId = '' } = useParams()
  const navigate = useNavigate()
  const { draft, patchDraft } = useCreatePostDraft()

  const base = userCreatePostPath(userId)

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="create-image" className="text-sm font-medium text-foreground">
          URL da imagem (opcional)
        </label>
        <input
          id="create-image"
          type="url"
          value={draft.imageUrl}
          onChange={(e) => patchDraft({ imageUrl: e.target.value })}
          placeholder="https://…"
          className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          No mock não há upload de ficheiros; cola um link público se quiseres pré-visualizar abaixo.
        </p>
      </div>

      {draft.imageUrl.trim() ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
          <img
            src={draft.imageUrl.trim()}
            alt=""
            className="max-h-64 w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      ) : null}

      <div>
        <span className="text-sm font-medium text-foreground">Visibilidade</span>
        <div className="mt-3 flex flex-wrap gap-3">
          {(
            [
              { value: 'public' as const, label: 'Público' },
              { value: 'followers' as const, label: 'Só seguidores' },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="visibility"
                checked={draft.visibility === value}
                onChange={() => patchDraft({ visibility: value })}
                className="text-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`${base}/content`)}
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:bg-muted/60"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => navigate(`${base}/review`)}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
        >
          Seguinte: rever
        </button>
      </div>
    </div>
  )
}
