export const fetchBySlug = (slug: String) => {
  const nuxtApp = useNuxtApp()
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'

  const key = `news-detail-${slug}`

  const { data: newsDetail } = useAsyncData(
    key,
    () => get(`/news/slug/${slug}/lang/${locale.value}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/news/slug/${slug}/lang/${fb()}`)
        : Promise.reject(e)),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  watch(locale, async (newLocale) => {
    newsDetail.value = await get(`/news/slug/${slug}/lang/${newLocale}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/news/slug/${slug}/lang/${fb()}`)
        : Promise.reject(e))
  }, { flush: 'post' })

  return { newsDetail }
}