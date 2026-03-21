/** Abas da barra principal (rotas em `/?tab=`). */
export const MAIN_NAV_TABS = ['feed', 'profile', 'pessoas', 'ranking'] as const
export type MainNavTab = (typeof MAIN_NAV_TABS)[number]

export function parseMainNavTab(searchParams: URLSearchParams): MainNavTab {
  const tab = searchParams.get('tab')
  return MAIN_NAV_TABS.includes(tab as MainNavTab) ? (tab as MainNavTab) : 'feed'
}
