import { useCallback, useEffect, useState, type RefObject } from 'react'

const DEFAULT_APPROX_HEIGHT = 100
const DEFAULT_MARGIN = 10

export type TooltipAnchorCoords = { top: number; left: number }

type Options = {
  /** Quando falso, não regista listeners de scroll/resize (ex.: tooltip fechado). */
  enabled?: boolean
  approxHeight?: number
  margin?: number
}

/**
 * Posiciona um tooltip fixo centrado no eixo X do âncora, preferindo abaixo e invertendo se não couber.
 * Extrair para aqui facilita trocar depois por `@floating-ui/react` mantendo a mesma API de `coords` + `updatePosition`.
 */
export function useTooltipAnchorPosition(
  anchorRef: RefObject<HTMLElement | null>,
  options?: Options,
): { coords: TooltipAnchorCoords; updatePosition: () => void } {
  const enabled = options?.enabled ?? true
  const approxHeight = options?.approxHeight ?? DEFAULT_APPROX_HEIGHT
  const margin = options?.margin ?? DEFAULT_MARGIN

  const [coords, setCoords] = useState<TooltipAnchorCoords>({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    let top = r.bottom + margin
    if (top + approxHeight > window.innerHeight - margin) {
      top = Math.max(margin, r.top - approxHeight - margin)
    }
    const left = Math.min(
      window.innerWidth - margin,
      Math.max(margin, r.left + r.width / 2),
    )
    setCoords({ top, left })
  }, [anchorRef, approxHeight, margin])

  useEffect(() => {
    if (!enabled) return
    const onScrollOrResize = () => updatePosition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [enabled, updatePosition])

  return { coords, updatePosition }
}
