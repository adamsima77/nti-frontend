export const fetchBySlug = (slug: String) => {
  const nuxtApp = useNuxtApp()
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'
  const key = `news-detail-${slug}`
  const pending = ref(false)

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
    pending.value = true
    newsDetail.value = null
    try {
      newsDetail.value = await get(`/news/slug/${slug}/lang/${newLocale}`)
        .catch((e: any) => e?.response?.status === 404
          ? get(`/news/slug/${slug}/lang/${fb()}`)
          : Promise.reject(e))
    } finally {
      pending.value = false
    }
  }, { flush: 'post' })

  return { newsDetail, pending }
}