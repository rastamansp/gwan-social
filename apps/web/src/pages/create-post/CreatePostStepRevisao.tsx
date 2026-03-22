import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useCreatePostDraft } from '@/contexts/CreatePostDraftContext'
import { ApiHttpError } from '@/lib/api/client'
import { fetchCreatePost } from '@/lib/api/endpoints'
import { isApiEnabled } from '@/lib/api/config'
import { createPostPath, myProfilePath } from '@/lib/routes'

export default function CreatePostStepRevisao() {
  const navigate = useNavigate()
  const { draft, resetDraft } = useCreatePostDraft()
  const [filePreviews, setFilePreviews] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  const base = createPostPath()
  const apiMode = isApiEnabled()

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

  const visibilityLabel = draft.visibility === 'public' ? 'Público' : 'Só seguidores'

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pré-visualização</p>
        <p className="mt-3 whitespace-pre-wrap font-display text-lg font-light leading-relaxed text-foreground sm:text-xl">
          {draft.content.trim() || '(sem texto)'}
        </p>
        {apiMode && filePreviews.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filePreviews.map((src, i) => (
              <div key={`${i}-${src.slice(-8)}`} className="overflow-hidden rounded-xl border border-border">
                <img src={src} alt="" className="aspect-video w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}
        {!apiMode && draft.imageUrl.trim() ? (
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

      {publishError ? (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {publishError}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`${base}/media`)}
          disabled={publishing}
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:bg-muted/60 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={publishing}
          onClick={async () => {
            setPublishError(null)
            if (apiMode) {
              if (!draft.content.trim()) {
                setPublishError('Preenche o texto da postagem no primeiro passo.')
                return
              }
              setPublishing(true)
              try {
                await fetchCreatePost({
                  content: draft.content.trim(),
                  visibility: draft.visibility,
                  imageFiles: draft.imageFiles,
                })
                resetDraft()
                navigate(myProfilePath(), { replace: false, state: { createPostPublished: true } })
              } catch (err) {
                setPublishError(
                  err instanceof ApiHttpError ? err.message : 'Não foi possível publicar.',
                )
              } finally {
                setPublishing(false)
              }
              return
            }
            resetDraft()
            navigate(myProfilePath(), { state: { createPostDemoDone: true } })
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50"
        >
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {apiMode ? 'Publicar' : 'Publicar (demo)'}
        </button>
      </div>
    </div>
  )
}
