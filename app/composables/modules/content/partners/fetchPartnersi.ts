export const fetchPartnersi = () => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const nuxtApp = useNuxtApp()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'

  const currentPage = ref(1)
  const partnersList = ref<any[]>([])
  const meta = ref<any>(null)
  const isFetching = ref(false)
  const initialized = ref(false)

  const { data: partners } = useAsyncData(
    `partners`,
    () => get(`/partners/lang/${locale.value}?page=1`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/partners/lang/${fb()}?page=1`)
        : Promise.reject(e)),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  // only seed once from SSR data
  watch(partners, (val) => {
    if (val?.data && !initialized.value) {
      partnersList.value = val.data
      meta.value = val.meta
      initialized.value = true
    }
  }, { immediate: true })

  watch(locale, async (newLocale) => {
    currentPage.value = 1
    partnersList.value = []
    meta.value = null
    initialized.value = false
    const res = await get(`/partners/lang/${newLocale}?page=1`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/partners/lang/${fb()}?page=1`)
        : Promise.reject(e))
    if (res?.data) {
      partnersList.value = res.data
      meta.value = res.meta
      initialized.value = true
    }
  }, { flush: 'post' })

  const fetchNextPage = async () => {
    if (isFetching.value) return
    if (!meta.value || currentPage.value >= meta.value.last_page) return

    isFetching.value = true
    const nextPage = currentPage.value + 1

    const res = await get(`/partners/lang/${locale.value}?page=${nextPage}`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/partners/lang/${fb()}?page=${nextPage}`)
        : Promise.reject(e))

    if (res?.data) {
      partnersList.value = [...partnersList.value, ...res.data]
      meta.value = res.meta
      currentPage.value = nextPage
    }

    isFetching.value = false
  }

  return { partnersList, meta, isFetching, fetchNextPage }
}