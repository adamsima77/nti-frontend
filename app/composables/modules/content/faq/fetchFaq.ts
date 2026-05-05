export const useFaq = (pageId: number) => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()

  const fb = () =>
    typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'

  const { data: faq, pending: faq_pending } = useAsyncData(
    () => `faq-${pageId}-${locale.value}`,
    async () => {
      try {
        return await get(`/pages/${pageId}/faq/${locale.value}`)
      } catch (e: any) {
        if (e?.response?.status === 404) {
          return await get(`/pages/${pageId}/faq/${fb()}`)
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

  return { faq, faq_pending }
}