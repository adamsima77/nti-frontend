import { mapCall } from './fetchCalls'
import type { Call } from './fetchCalls'

export const useCall = (id: string | number) => {
  const api = useApi()
  const { locale } = useI18n()

  const { data, pending, error, refresh } = useAsyncData(
    () => `call-detail-${id}-${locale.value}`,
    async () => {
      // raw json response, no CallResource wrapper, same as fetchCallByLang
      const res = await api.get(`/calls/${id}/lang/${locale.value}`) as any
      return mapCall(res)
    },
    {
      watch: [() => locale.value],
      default: () => null as Call | null,
    }
  )

  return {
    call: computed(() => data.value ?? null),
    pending,
    error,
    refresh,
  }
}