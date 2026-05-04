export const fetchMentors = () => {

  //TODO:
  const { get } = useApi()
  const nuxtApp = useNuxtApp()

  const { data: mentors, pending } = useAsyncData(
    `members`,  
    () => get(``)
      .catch((e: any) => e?.response?.status === 404
        ? get(``)
        : Promise.reject(e)),
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      getCachedData: (key) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  return { mentors, pending }
}