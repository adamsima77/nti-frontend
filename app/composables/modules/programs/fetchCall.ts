import type { Call } from './fetchCalls'

const mapCall = (c: any): Call => ({
  id: c.id,

  programId: c.program?.id,
  programName: c.program?.name ?? '',

  organization: c.organization?.name ?? '',

  title: c.name,
  description: c.description,


  applicationStart: c.application_start,
  applicationDeadline: c.application_deadline,

  startDate: c.project_start,
  endDate: c.project_end,

  status: c.is_open ? 'open' : 'closed',

  formSchema: c.form_schema ?? { fields: [] },

  applicantsCount: c.applicants_count ?? 0,
})

export const useCall = (id: string | number) => {
  const api = useApi()

  const { data, pending, error, refresh } = useAsyncData(
    `call-detail-${id}`,
    async () => {
      const res = await api.get(`/calls/${id}`)
      return mapCall(res.data) 
    },
    {
      default: () => null as Call | null,
    }
  )

  const call = computed(() => data.value ?? null)

  return { call, pending, error, refresh }
}