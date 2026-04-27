export const useNews = () => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const nuxtApp = useNuxtApp()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'

  const currentPage = ref(1)

  const { data: news } = useAsyncData(
    `news`,
    () => get(`/news/lang/${locale.value}?page=${currentPage.value}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/news/lang/${fb()}?page=${currentPage.value}`)
        : Promise.reject(e)),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  watch([locale, currentPage], async ([newLocale]) => {
    news.value = await get(`/news/lang/${newLocale}?page=${currentPage.value}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/news/lang/${fb()}?page=${currentPage.value}`)
        : Promise.reject(e))
  }, { flush: 'post' })

  return { news, currentPage }
}
