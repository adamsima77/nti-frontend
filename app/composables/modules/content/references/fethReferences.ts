export const fetchReferences = () => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()
  const nuxtApp = useNuxtApp()
  const fb = () => typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'

  const currentPage = ref(1)
  const referencesList = ref<any[]>([])
  const meta = ref<any>(null)
  const isFetching = ref(false)
  const initialized = ref(false)
  const pending = ref(false)

  const { data: references } = useAsyncData(
    `references-${locale.value}`,
    () => get(`/partner-references/lang/${locale.value}?page=1`)
      .catch((e: any) => e?.response?.status === 404
        ? get(`/partner-references/lang/${fb()}?page=1`)
        : Promise.reject(e)),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  watch(references, (val) => {
    if (val?.data && !initialized.value) {
      referencesList.value = val.data
      meta.value = val.meta
      initialized.value = true
    }
  }, { immediate: true })

  watch(locale, async (newLocale) => {
    pending.value = true
    currentPage.value = 1
    referencesList.value = []
    meta.value = null
    initialized.value = false
    try {
      const res = await get(`/partner-references/lang/${newLocale}?page=1`)
        .catch((e: any) => e?.response?.status === 404
          ? get(`/partner-references/lang/${fb()}?page=1`)
          : Promise.reject(e))
      if (res?.data) {
        referencesList.value = res.data
        meta.value = res.meta
        initialized.value = true
      }
    } finally {
      pending.value = false
    }
  }, { flush: 'post' })

  const fetchNextPage = async () => {
    if (isFetching.value) return
    if (!meta.value || currentPage.value >= meta.value.last_page) return

    isFetching.value = true
    const nextPage = currentPage.value + 1

    try {
      const res = await get(`/partner-references/lang/${locale.value}?page=${nextPage}`)
        .catch((e: any) => e?.response?.status === 404
          ? get(`/partner-references/lang/${fb()}?page=${nextPage}`)
          : Promise.reject(e))
      if (res?.data) {
        referencesList.value = [...referencesList.value, ...res.data]
        meta.value = res.meta
        currentPage.value = nextPage
      }
    } finally {
      isFetching.value = false
    }
  }

  return { referencesList, meta, isFetching, fetchNextPage, pending }
}