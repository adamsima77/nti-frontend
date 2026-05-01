export const fetchMeta = (pageId: number) => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'
  const nuxtApp = useNuxtApp()

  const { data: metaTags } = useAsyncData(
    `metaTags-${pageId}`,  // pageId makes it stable per page, no locale needed
    () => get(`/pages/${pageId}/meta-tags/${locale.value}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/pages/${pageId}/meta-tags/${fb()}`)
        : Promise.reject(e)),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  watch(locale, async (newLocale) => {
    metaTags.value = await get(`/pages/${pageId}/meta-tags/${newLocale}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/pages/${pageId}/meta-tags/${fb()}`)
        : Promise.reject(e))
  }, { flush: 'post' })

  return { metaTags }
}