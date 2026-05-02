export const useNews = () => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const nuxtApp = useNuxtApp()

  const fb = () =>
    typeof fallbackLocale.value === 'string'
      ? fallbackLocale.value
      : 'en'

  const currentPage = ref(1)

  const sleep = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))

  const { data: news, pending, refresh } = useAsyncData(
    () => `news-${locale.value}-${currentPage.value}`,
    async () => {
      return await get(
        `/news/lang/${locale.value}?page=${currentPage.value}`
      ).catch((e: any) =>
        e?.response?.status === 404
          ? get(`/news/lang/${fb()}?page=${currentPage.value}`)
          : Promise.reject(e)
      )
    },
    {
      server: true,
      lazy: false,
      watch: [locale, currentPage],
      dedupe: 'cancel',
      getCachedData: (key) =>
        nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  return { news, currentPage, pending, refresh }
}