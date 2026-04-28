export const fetchPartners = () => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const nuxtApp = useNuxtApp()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'

  const currentPage = ref(1)

  const { data: partners, pending } = useAsyncData(
  `partners`,
  () => get(`/partners/lang/${locale.value}?page=${currentPage.value}`)
    .catch((e: any) => e?.response?.status === 404
      ? get(`/partners/lang/${fb()}?page=${currentPage.value}`)
      : Promise.reject(e)),
  {
    server: true,
    lazy: false,
    dedupe: 'cancel',
    getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  }
)

  watch([locale, currentPage], async ([newLocale]) => {
    partners.value = await get(`/partners/lang/${newLocale}?page=${currentPage.value}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/partners/lang/${fb()}?page=${currentPage.value}`)
        : Promise.reject(e))
  }, { flush: 'post' })

  return { partners, currentPage, pending }
}