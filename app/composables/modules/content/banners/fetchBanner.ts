export const useBanner = (pageId: number) => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()

  const fb = () =>
    typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'

  const { data: banner, pending } = useAsyncData(
    () => `banner-${pageId}-${locale.value}`,
    async () => {
      try {
        return await get(`/pages/${pageId}/hero-banner/${locale.value}`)
      } catch (e: any) {
        if (e?.response?.status === 404) {
          return await get(`/pages/${pageId}/hero-banner/${fb()}`)
        }
        throw e
      }
    },
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      watch: [locale], 
    }
  )

  return { banner, pending }
}