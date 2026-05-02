export const fetchProgramsByLang = () => {
      const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'
  const nuxtApp = useNuxtApp()

  const { data: programs, programs_pending } = useAsyncData(
    `programs-${locale.value}`,  
    () => get(`/programs/lang/${locale.value}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/programs/lang/${fb()}`)
        : Promise.reject(e)),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  watch(locale, async (newLocale) => {
    programs.value = await get(`/programs/lang/${newLocale}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/programs/lang/${fb()}`)
        : Promise.reject(e))
  }, { flush: 'post' })

  return { programs, programs_pending }

}