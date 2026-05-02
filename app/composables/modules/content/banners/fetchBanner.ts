export const useBanner = (pageId: number) => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'
  const nuxtApp = useNuxtApp()
  const pending = ref(false)

  const key = `banner-${pageId}-${locale.value}` // locale IN the key now

  const { data: banner } = useAsyncData(
    key,
    () => get(`/pages/${pageId}/hero-banner/${locale.value}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/pages/${pageId}/hero-banner/${fb()}`)
        : Promise.reject(e)),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  watch(locale, async () => {
    pending.value = true
    banner.value = null // triggers skeleton immediately
    try {
      banner.value = await get(`/pages/${pageId}/hero-banner/${locale.value}`)
        .catch((e: any) => e?.response?.status === 404
          ? get(`/pages/${pageId}/hero-banner/${fb()}`)
          : Promise.reject(e))
    } finally {
      pending.value = false
    }
  }, { flush: 'post' })

  return { banner, pending }
}