export const useMembers = () => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'
  const nuxtApp = useNuxtApp()

  const { data: members, pending } = useAsyncData(
    `members`,  
    () => get(`/public/site-members/lang/${locale.value}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/public/site-members/lang/${fb()}`)
        : Promise.reject(e)),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  watch(locale, async (newLocale) => {
    members.value = await get(`/public/site-members/lang/${newLocale}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/public/site-members/lang/${fb()}`)
        : Promise.reject(e))
  }, { flush: 'post' })

  return { members, pending }
}