export interface Call {
  id: number

  programId: number
  programName: string

  organization: string

  title: string
  description: string

  applicationStart: string
  applicationDeadline: string

  startDate: string
  endDate: string

  status: 'open' | 'closed'

  formSchema: FormSchema

  applicantsCount?: number
}

const mapCall = (c: any): Call => ({
  id: c.id,

  programId: c.program?.id ?? 0,
  programName: c.program?.name ?? '',

  organization: c.organization?.name ?? '',

  title: c.name ?? '',
  description: c.description ?? '',

  applicationStart: c.application_start,
  applicationDeadline: c.application_deadline,

  startDate: c.project_start,
  endDate: c.project_end,

  // ❗ derive from something real if backend doesn't provide is_open
  status: new Date(c.application_deadline) > new Date() ? 'open' : 'closed',

  formSchema: c.form_schema ?? { fields: [] },

  // only if backend truly supports it later
  applicantsCount: c.applicants_count ?? 0,
})

export const useCalls = (pageRef: Ref<number> = ref(1), perPage = 9) => {
  const api = useApi()
  const { locale, fallbackLocale } = useI18n()
  const nuxtApp = useNuxtApp()

  const fb = () =>
    typeof fallbackLocale.value === 'string' ? fallbackLocale.value : 'en'

  const key = computed(
    () => `calls-${locale.value}-${pageRef.value}-${perPage}`
  )

  const { data, pending, error, refresh } = useAsyncData(
    key,
    async () => {
      const res = await api.get(
        `/calls/lang/${locale.value}?page=${pageRef.value}&per_page=${perPage}`
      )

      const payload = res?.data

      return {
        data: (payload?.data ?? []).map(mapCall),
        meta: {
          current_page: payload?.current_page ?? 1,
          last_page: payload?.last_page ?? 1,
          total: payload?.total ?? 0,
          per_page: payload?.per_page ?? perPage,
        },
      }
    },
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      watch: [pageRef, locale],
      default: () => ({
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: perPage,
        },
      }),
      getCachedData: (key) =>
        nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    }
  )

  return {
    calls: computed(() => data.value?.data ?? []),
    meta: computed(() => data.value?.meta ?? null),
    pending,
    error,
    refresh,
  }
}