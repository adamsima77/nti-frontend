export const fetchPartners = () => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const nuxtApp = useNuxtApp()

  const currentPage = ref(1)

  const fb = () =>
    typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'

  const key = computed(() => `partners-${locale.value}-${currentPage.value}`)

  const { data: partners, pending: partner_pending, refresh } = useAsyncData(
    key,
    async () => {
      try {
        return await get(`/partners/lang/${locale.value}?page=${currentPage.value}`)
      } catch (e: any) {
        if (e?.response?.status === 404) {
          return await get(`/partners/lang/${fb()}?page=${currentPage.value}`)
        }
        throw e
      }
    },
    {
      server: true,
      lazy: false,
      watch: [locale, currentPage],
      getCachedData: (key) =>
        nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  return { partners, currentPage, partner_pending, refresh }
}