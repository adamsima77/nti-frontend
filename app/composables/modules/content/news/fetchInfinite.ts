export const fetchInfinite = () => {
  const { locale, fallbackLocale } = useI18n()
  const { get } = useApi()

  const currentPage = ref(1)
  const loading = ref(false)

  const fb = () =>
    typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'

  const fetchPage = async (page: number) => {
    return get(`/news/lang/${locale.value}?page=${page}`)
      .catch((e: any) =>
        e?.response?.status === 404
          ? get(`/news/lang/${fb()}?page=${page}`)
          : Promise.reject(e)
      )
  }

  const { data: news, refresh } = useAsyncData(
    `news-${locale.value}`,
    () => fetchPage(1),
    {
      watch: [locale],
      server: true,
    }
  )

  const articles = computed(() => news.value?.data ?? [])
  const lastPage = computed(() => news.value?.last_page ?? 1)

  const hasMore = computed(() => currentPage.value < lastPage.value)

  const loadMore = async () => {
    if (!hasMore.value || loading.value) return

    loading.value = true
    try {
      const next = await fetchPage(currentPage.value + 1)

      news.value = {
        ...next,
        data: [...(news.value?.data ?? []), ...next.data],
      }

      currentPage.value++
    } finally {
      loading.value = false
    }
  }

  return { articles, loading, hasMore, loadMore, refresh }
}