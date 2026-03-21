/* eslint-disable react-refresh/only-export-components -- Provider + hook no mesmo módulo é padrão para contexto */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type CreatePostDraft = {
  title: string
  body: string
  imageUrl: string
  visibility: 'public' | 'followers'
}

const emptyDraft: CreatePostDraft = {
  title: '',
  body: '',
  imageUrl: '',
  visibility: 'public',
}

type CreatePostDraftContextValue = {
  draft: CreatePostDraft
  setDraft: (next: CreatePostDraft | ((prev: CreatePostDraft) => CreatePostDraft)) => void
  patchDraft: (partial: Partial<CreatePostDraft>) => void
  resetDraft: () => void
}

const CreatePostDraftContext = createContext<CreatePostDraftContextValue | null>(null)

export function CreatePostDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<CreatePostDraft>(emptyDraft)

  const patchDraft = useCallback((partial: Partial<CreatePostDraft>) => {
    setDraft((d) => ({ ...d, ...partial }))
  }, [])

  const resetDraft = useCallback(() => {
    setDraft(emptyDraft)
  }, [])

  const value = useMemo(
    () => ({ draft, setDraft, patchDraft, resetDraft }),
    [draft, patchDraft, resetDraft],
  )

  return (
    <CreatePostDraftContext.Provider value={value}>{children}</CreatePostDraftContext.Provider>
  )
}

export function useCreatePostDraft() {
  const ctx = useContext(CreatePostDraftContext)
  if (!ctx) {
    throw new Error('useCreatePostDraft deve ser usado dentro de CreatePostDraftProvider')
  }
  return ctx
}
