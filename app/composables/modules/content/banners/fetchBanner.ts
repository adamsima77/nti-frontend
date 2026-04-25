export const useBanner = (pageId: number) => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'
 
  const { data: banner } = useAsyncData(
    `banner-${pageId}`,  
    () => get(`/pages/${pageId}/hero-banner/${locale.value}`)
          .catch((e: any) => e?.response?.status === 404 ? get(`/pages/${pageId}/hero-banner/${fb()}`) : Promise.reject(e)),
    {
      watch: [locale],
      server: true,
      lazy: false,
      dedupe: 'defer',  // Prevents fetching duplicates during hydration
    }
  )
 
  return { banner }
}