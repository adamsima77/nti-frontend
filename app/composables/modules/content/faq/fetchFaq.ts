export const useFaq = (pageId: number) => {
  const nuxtApp = useNuxtApp()
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'
  const key = `faq-${pageId}`
  const faq_pending = ref(false)

  const { data: faq } = useAsyncData(
    key,
    () => get(`/pages/${pageId}/faq/${locale.value}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/pages/${pageId}/faq/${fb()}`)
        : Promise.reject(e)),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  watch(locale, async (newLocale) => {
    faq_pending.value = true
    faq.value = null
    try {
      faq.value = await get(`/pages/${pageId}/faq/${newLocale}`)
        .catch((e: any) => e?.response?.status === 404
          ? get(`/pages/${pageId}/faq/${fb()}`)
          : Promise.reject(e))
    } finally {
      faq_pending.value = false
    }
  }, { flush: 'post' })

  return { faq, faq_pending }
}