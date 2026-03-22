import { useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePostDraft } from '@/contexts/CreatePostDraftContext'
import { isApiEnabled } from '@/lib/api/config'
import { createPostPath } from '@/lib/routes'

const MAX_IMAGES = 10

export default function CreatePostStepMidia() {
  const navigate = useNavigate()
  const { draft, patchDraft } = useCreatePostDraft()
  const fileInputId = useId()
  const [filePreviews, setFilePreviews] = useState<string[]>([])
  const apiMode = isApiEnabled()

  const base = createPostPath()

  useEffect(() => {
    const files = draft.imageFiles
    if (!files.length) {
      setFilePreviews([])
      return
    }
    const urls = files.map((f) => URL.createObjectURL(f))
    setFilePreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [draft.imageFiles])

  return (
    <div className="space-y-6">
      {apiMode ? (
        <div>
          <label htmlFor={fileInputId} className="text-sm font-medium text-foreground">
            Imagens (opcional)
          </label>
          <input
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="mt-2 block w-full cursor-pointer text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? [])
              const next = picked.slice(0, MAX_IMAGES)
              patchDraft({ imageFiles: next, imageUrl: '' })
              e.target.value = ''
            }}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            JPEG, PNG ou WebP — até {MAX_IMAGES} ficheiros (5 MB cada no servidor). Podes selecionar várias
            de uma vez. São enviados para o MinIO ao publicares.
          </p>
          {draft.imageFiles.length > 0 ? (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-destructive underline-offset-2 hover:underline"
              onClick={() => patchDraft({ imageFiles: [] })}
            >
              Remover todas as imagens
            </button>
          ) : null}
        </div>
      ) : (
        <div>
          <label htmlFor="create-image" className="text-sm font-medium text-foreground">
            URL da imagem (opcional)
          </label>
          <input
            id="create-image"
            type="url"
            value={draft.imageUrl}
            onChange={(e) => patchDraft({ imageUrl: e.target.value, imageFiles: [] })}
            placeholder="https://…"
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary/20 focus:border-primary/40 focus:ring-2"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Sem API ativa, não há upload multipart; cola um link público para pré-visualizar. Com API e MinIO, usa os ficheiros acima.
          </p>
        </div>
      )}

      {apiMode && filePreviews.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {filePreviews.map((src, i) => (
            <div
              key={`${src.slice(-12)}-${i}`}
              className="overflow-hidden rounded-xl border border-border bg-muted/30"
            >
              <img src={src} alt="" className="aspect-square w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}
      {!apiMode && draft.imageUrl.trim() ? (
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
