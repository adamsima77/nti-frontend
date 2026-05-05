export interface CallCriterion {
  id: number
  name: string
}

export interface FormSchema {
  fields: any[]
}

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
  criteria: CallCriterion[]
}

export const mapCall = (c: any): Call => ({  // ✅ was: const mapCall
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
  status: c.application_deadline && new Date(c.application_deadline) > new Date()
    ? 'open'
    : 'closed',
  formSchema: c.form_schema ?? { fields: [] },
  applicantsCount: c.applicants_count ?? 0,
  criteria: (c.call_criteria ?? []).map((cr: any) => ({
    id: cr.id,
    name: cr.name,
  })),
})

export const useCalls = (pageRef: Ref<number> = ref(1), perPage = 9) => {
  const api = useApi()
  const { locale } = useI18n()

  const { data, pending, error, refresh } = useAsyncData(
    () => `calls-${locale.value}-${pageRef.value}-${perPage}`,
    async () => {
      const res = await api.get(
        `/calls/lang/${locale.value}?page=${pageRef.value}&per_page=${perPage}`
      ) as any

      return {
        data: (res?.data ?? []).map(mapCall),
        meta: {
          current_page: res?.current_page ?? 1,
          last_page: res?.last_page ?? 1,
          total: res?.total ?? 0,
          per_page: res?.per_page ?? perPage,
        },
      }
    },
    {
      server: true,
      lazy: false,
      dedupe: 'cancel',
      watch: [pageRef, locale],
      default: () => ({
        data: [] as Call[],
        meta: {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: perPage,
        },
      }),
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