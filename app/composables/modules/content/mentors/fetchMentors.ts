// fetchMentors.ts
export const fetchMentors = () => {
  const { get } = useApi()
  const nuxtApp = useNuxtApp()

  const page = ref(1)
  const mentorsList = ref<any[]>([])
  const isFetching = ref(false)
  const hasMore = ref(true)

  const { data, pending } = useAsyncData(
    'mentors',
    () => get(`/fetch-mentors?page=1`),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  watch(data, (val) => {
    if (!val) return
    mentorsList.value = val.data ?? []
    hasMore.value = !!val.next_page_url
  }, { immediate: true })

  const fetchNextPage = async () => {
    if (isFetching.value || !hasMore.value) return
    isFetching.value = true
    page.value++
    try {
      const res = await get(`/fetch-mentors?page=${page.value}`)
      mentorsList.value.push(...(res.data ?? []))
      hasMore.value = !!res.next_page_url
    } finally {
      isFetching.value = false
    }
  }

  return { mentorsList, isFetching, fetchNextPage, pending }
}