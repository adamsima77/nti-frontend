<!-- pages/hodnotenie/[id].vue -->
<template>
  <div class="max-w-5xl mx-auto px-6 py-10">

    <!-- Back -->
    <NuxtLink to="/hodnotenie/zoznam" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6">
      <ChevronLeft class="w-4 h-4" /> Späť na zoznam hodnotení
    </NuxtLink>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h1 class="text-2xl font-bold text-navy">{{ application.projectName }}</h1>
          <UiStatusBadge :status="application.status" />
          <span class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="application.program === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'">
            Program {{ application.program }}
          </span>
        </div>
        <p class="text-gray-500 text-sm">{{ application.teamName }} · Podané {{ application.submittedAt }}</p>
      </div>
      <!-- Overall commission score if available -->
      <div v-if="application.avgScore" class="shrink-0 text-center bg-white border border-gray-100 rounded-lg px-5 py-3">
        <p class="text-3xl font-bold text-navy">{{ application.avgScore }}</p>
        <p class="text-xs text-gray-400">priemer komisie / 100</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Left: application info + scoring -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Application info -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
            <FileText class="w-4 h-4 text-blue-500" /> Prihláška
          </h2>
          <div class="space-y-3 text-sm">
            <p class="text-gray-700 leading-relaxed">{{ application.description }}</p>
            <div class="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div v-for="doc in application.documents" :key="doc.name">
                <a :href="doc.url" target="_blank"
                  class="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-xs">
                  <Paperclip class="w-3.5 h-3.5" /> {{ doc.name }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Scoring form ── -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy mb-1 flex items-center gap-2">
            <Star class="w-4 h-4 text-warning-500" /> Scoring formulár
          </h2>
          <p class="text-xs text-gray-400 mb-5">Ohodnoťte každé kritérium od 0 do maximálneho počtu bodov</p>

          <div class="space-y-5">
            <div v-for="criterion in scoringForm.criteria" :key="criterion.id" class="border border-gray-100 rounded-lg p-4">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p class="font-medium text-navy text-sm">{{ criterion.label }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ criterion.description }}</p>
                </div>
                <div class="shrink-0 text-right">
                  <span class="text-xs text-gray-400">max {{ criterion.maxScore }} b.</span>
                </div>
              </div>

              <!-- Score slider + input -->
              <div class="flex items-center gap-3 mb-2">
                <input
                  type="range"
                  :min="0"
                  :max="criterion.maxScore"
                  v-model.number="criterion.score"
                  :disabled="isSubmitted"
                  class="flex-1 accent-blue-600"
                />
                <div class="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    :min="0"
                    :max="criterion.maxScore"
                    v-model.number="criterion.score"
                    :disabled="isSubmitted"
                    class="w-14 px-2 py-1 rounded border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
                  />
                  <span class="text-xs text-gray-400">/ {{ criterion.maxScore }}</span>
                </div>
              </div>

              <!-- Score bar -->
              <div class="bg-gray-100 rounded-full h-1.5 mb-3">
                <div
                  class="h-1.5 rounded-full transition-all"
                  :class="scoreBarColor(criterion.score / criterion.maxScore)"
                  :style="{ width: `${(criterion.score / criterion.maxScore) * 100}%` }"
                />
              </div>

              <!-- Criterion comment -->
              <textarea
                v-model="criterion.comment"
                :disabled="isSubmitted"
                :placeholder="`Komentár k hodnoteniu: ${criterion.label.toLowerCase()}...`"
                rows="2"
                class="w-full px-3 py-2 rounded-md border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          <!-- Total score -->
          <div class="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Celkový skór</p>
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-bold" :class="totalScoreColor">{{ totalScore }}</span>
                <span class="text-gray-400 text-sm">/ {{ maxTotalScore }} bodov</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold" :class="totalScoreColor">{{ totalScorePercent }}%</div>
              <p class="text-xs" :class="totalScoreColor">{{ scoringLabel }}</p>
            </div>
          </div>
        </div>

        <!-- General comment + recommendation -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
            <MessageSquare class="w-4 h-4 text-blue-500" /> Celkový komentár a odporúčanie
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Interná poznámka pre komisiu</label>
              <textarea
                v-model="scoringForm.internalNote"
                :disabled="isSubmitted"
                placeholder="Poznámky viditeľné iba pre členov komisie..."
                rows="3"
                class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none disabled:bg-gray-50"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Odporúčanie</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  v-for="rec in recommendations"
                  :key="rec.value"
                  type="button"
                  :disabled="isSubmitted"
                  @click="scoringForm.recommendation = rec.value"
                  class="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="scoringForm.recommendation === rec.value ? rec.activeClass : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
                >
                  <component :is="rec.icon" class="w-4 h-4" />
                  {{ rec.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Decision section ── -->
        <div v-if="!isSubmitted" class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
            <Gavel class="w-4 h-4 text-blue-500" /> Odoslanie hodnotenia
          </h2>

          <!-- Request supplement option -->
          <div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                v-model="scoringForm.requestSupplement"
                class="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <div>
                <p class="text-sm font-medium text-navy">Vyžiadať doplnenie prihlášky</p>
                <p class="text-xs text-gray-500 mt-0.5">Tím dostane notifikáciu s požiadavkou na doplnenie podkladov</p>
              </div>
            </label>
            <div v-if="scoringForm.requestSupplement" class="mt-3 ml-7">
              <textarea
                v-model="scoringForm.supplementNote"
                placeholder="Čo konkrétne má tím doplniť..."
                rows="2"
                class="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
          </div>

          <div v-if="submitError" class="mb-4 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" /> {{ submitError }}
          </div>

          <div v-if="lastAutoSaveTime" class="mb-4 text-xs text-gray-500 text-center">
            💾 Rozpracované bolo uložené: {{ lastAutoSaveTime }}
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="handleSaveDraft"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Uložiť rozpracované
            </button>
            <button
              @click="handleSubmit"
              :disabled="isSubmitting || !scoringForm.recommendation"
              class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
              </svg>
              {{ isSubmitting ? 'Odosielam...' : 'Odoslať hodnotenie' }}
            </button>
          </div>
          <p v-if="!scoringForm.recommendation" class="text-xs text-gray-400 mt-2 text-center">
            Pred odoslaním vyberte odporúčanie
          </p>
        </div>

        <!-- Submitted state -->
        <div v-else class="bg-success-50 border border-success-200 rounded-lg p-5 flex items-center gap-3">
          <CheckCircle class="w-5 h-5 text-success-500 shrink-0" />
          <div>
            <p class="font-medium text-success-700">Hodnotenie bolo odoslané</p>
            <p class="text-xs text-success-600 mt-0.5">Vaše hodnotenie bolo zaznamenané a je viditeľné pre ostatných členov komisie.</p>
          </div>
        </div>

      </div>

      <!-- Right sidebar -->
      <div class="space-y-4">

        <!-- Commission overview -->
        <div class="bg-white rounded-lg border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Komisia</h3>
          <div class="space-y-3">
            <div v-for="member in application.commissionMembers" :key="member.id" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {{ member.name.split(' ').map((n: string) => n[0]).join('') }}
                </div>
                <span class="text-sm text-navy">{{ member.name }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span v-if="member.score !== null" class="text-sm font-semibold text-navy">{{ member.score }}</span>
                <span v-else class="text-xs text-gray-400 italic">čaká</span>
              </div>
            </div>
          </div>
          <div v-if="application.avgScore" class="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span class="text-gray-500">Priemer</span>
            <span class="font-bold text-navy">{{ application.avgScore }}/100</span>
          </div>
        </div>

        <!-- Team info -->
        <div class="bg-white rounded-lg border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tím</h3>
          <div class="space-y-2">
            <div v-for="member in application.teamMembers" :key="member.id">
              <p class="text-sm font-medium text-navy">{{ member.name }}</p>
              <p class="text-xs text-gray-400">{{ member.role }}</p>
            </div>
          </div>
        </div>

        <!-- Application meta -->
        <div class="bg-white rounded-lg border border-gray-100 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Informácie</h3>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Program</span>
            <span class="font-medium text-navy">Program {{ application.program }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Podané</span>
            <span class="font-medium text-navy">{{ application.submittedAt }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Deadline hodnotenia</span>
            <span class="font-medium text-warning-500">{{ application.evaluationDeadline }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Dokumenty</span>
            <span class="font-medium text-navy">{{ application.documents.length }}</span>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
  ChevronLeft, FileText, Star, MessageSquare, Gavel,
  CheckCircle, AlertCircle, Paperclip,
  ThumbsUp, ThumbsDown, RotateCcw
} from 'lucide-vue-next'

definePageMeta({ 
  layout: 'portal', 
  //middleware: 'auth', 
  roles: ['evaluator'] 
})

const authStore = useAuthStore()
const api = useApi()

if (!authStore.user) {
  authStore.user = { 
    id: 20, 
    email: 'evaluator@nti.sk', 
    first_name: 'Eva', 
    last_name: 'Komisárová', 
    role: 'evaluator' 
  }
  authStore.token = 'mock-token'
}

const route = useRoute()
const router = useRouter()

useHead({ title: 'Hodnotenie prihlášky | NTI Komisia' })

// ── Mock application data ────────────────────────────────────
const application = reactive({
  id: Number(route.params.id),
  projectName: 'EcoTrack – Sledovanie uhlíkovej stopy',
  teamName: 'GreenTech tím',
  program: 'A',
  status: 'evaluating',
  submittedAt: '10.03.2026',
  evaluationDeadline: '15.04.2026',
  avgScore: null as number | null,
  description: 'EcoTrack je mobilná aplikácia umožňujúca používateľom sledovať a redukovať svoju uhlíkovú stopu prostredníctvom gamifikácie a personalizovaných odporúčaní. Cieľom je znížiť priemernú uhlíkovú stopu používateľa o 20% za 6 mesiacov.',
  documents: [
    { name: 'Executive Summary.pdf',    url: '#' },
    { name: 'Technická architektúra.pdf', url: '#' },
    { name: 'Roadmapa projektu.pdf',    url: '#' },
    { name: 'Rozpočet.xlsx',            url: '#' },
  ],
  teamMembers: [
    { id: 1, name: 'Tomáš Horváth', role: 'Vedúci tímu' },
    { id: 2, name: 'Lucia Free',    role: 'Backend developer' },
    { id: 3, name: 'Marek Blaho',   role: 'Frontend developer' },
    { id: 4, name: 'Zuzana Kováč',  role: 'UX dizajnér' },
  ],
  commissionMembers: [
    { id: 20, name: 'Eva Komisárová', score: null },
    { id: 21, name: 'Juraj Novák',    score: 82 },
    { id: 22, name: 'Anna Horáková',  score: 78 },
  ],
})

// ── Scoring form ─────────────────────────────────────────────
// Kritériá sú scoring templates z backendu — tu mock pre Program A
const scoringForm = reactive({
  criteria: [
    {
      id: 1,
      label: 'Inovatívnosť a originalita',
      description: 'Miera novosti riešenia, originalita myšlienky a diferenciácia oproti existujúcim produktom.',
      maxScore: 20,
      score: 0,
      comment: '',
    },
    {
      id: 2,
      label: 'Technická realizovateľnosť',
      description: 'Reálnosť technického riešenia, kompetentnosť tímu a kvalita technickej dokumentácie.',
      maxScore: 20,
      score: 0,
      comment: '',
    },
    {
      id: 3,
      label: 'Trhový potenciál',
      description: 'Veľkosť cieľového trhu, jasnosť hodnoty pre zákazníka a monetizačný model.',
      maxScore: 20,
      score: 0,
      comment: '',
    },
    {
      id: 4,
      label: 'Kvalita tímu',
      description: 'Skúsenosti, komplementárnosť rolí, motivácia a akademické predpoklady členov tímu.',
      maxScore: 20,
      score: 0,
      comment: '',
    },
    {
      id: 5,
      label: 'Prezentácia a dokumentácia',
      description: 'Kvalita predložených dokumentov, zrozumiteľnosť, štruktúra a profesionalita spracovania.',
      maxScore: 20,
      score: 0,
      comment: '',
    },
  ],
  internalNote:      '',
  recommendation:    '' as '' | 'approve' | 'reject' | 'supplement',
  requestSupplement: false,
  supplementNote:    '',
})

const isSubmitted  = ref(false)
const isSubmitting = ref(false)
const submitError  = ref<string | null>(null)
const lastAutoSaveTime = ref<string | null>(null)

// Setup debounced auto-save (30 seconds)
const { markDirty } = useAutoSave({
  debounceMs: 30000,
  onSave: async () => {
    try {
      // Save draft to API (when endpoint is available)
      await api.post(`/hodnotenie/${application.id}/draft`, {
        criteria: scoringForm.criteria,
        internalNote: scoringForm.internalNote,
        recommendation: scoringForm.recommendation,
        requestSupplement: scoringForm.requestSupplement,
        supplementNote: scoringForm.supplementNote,
      })
      lastAutoSaveTime.value = new Date().toLocaleTimeString('sk-SK')
    } catch (error) {
      console.error('Failed to save draft:', error)
      // Error is already handled by useApi toast notification
    }
  },
})

// Watch for changes to trigger auto-save
watch(
  () => scoringForm,
  () => {
    if (!isSubmitted.value) {
      markDirty()
    }
  },
  { deep: true }
)

// ── Computed ─────────────────────────────────────────────────
const totalScore    = computed(() => scoringForm.criteria.reduce((s, c) => s + (c.score || 0), 0))
const maxTotalScore = computed(() => scoringForm.criteria.reduce((s, c) => s + c.maxScore, 0))
const totalScorePercent = computed(() => Math.round((totalScore.value / maxTotalScore.value) * 100))

const scoringLabel = computed(() => {
  const p = totalScorePercent.value
  if (p >= 80) return 'Výborný'
  if (p >= 65) return 'Dobrý'
  if (p >= 50) return 'Dostatočný'
  return 'Nedostatočný'
})

const totalScoreColor = computed(() => {
  const p = totalScorePercent.value
  if (p >= 80) return 'text-success-500'
  if (p >= 65) return 'text-blue-600'
  if (p >= 50) return 'text-warning-500'
  return 'text-danger-500'
})

// ── Helpers ──────────────────────────────────────────────────
const scoreBarColor = (ratio: number) => {
  if (ratio >= 0.8) return 'bg-success-500'
  if (ratio >= 0.5) return 'bg-blue-500'
  if (ratio >= 0.3) return 'bg-warning-500'
  return 'bg-danger-500'
}

const recommendations: { value: '' | 'approve' | 'reject' | 'supplement'; label: string; icon: any; activeClass: string }[] = [
  {
    value: 'approve',
    label: 'Schváliť',
    icon: ThumbsUp,
    activeClass: 'border-success-300 bg-success-50 text-success-700',
  },
  {
    value: 'supplement',
    label: 'Doplniť',
    icon: RotateCcw,
    activeClass: 'border-warning-300 bg-warning-50 text-warning-700',
  },
  {
    value: 'reject',
    label: 'Zamietnuť',
    icon: ThumbsDown,
    activeClass: 'border-danger-300 bg-danger-50 text-danger-700',
  },
]

// ── Actions ───────────────────────────────────────────────────
const validate = () => {
  if (!scoringForm.recommendation) {
    submitError.value = 'Vyberte odporúčanie pred odoslaním hodnotenia.'
    return false
  }
  if (scoringForm.requestSupplement && !scoringForm.supplementNote.trim()) {
    submitError.value = 'Zadajte čo má tím doplniť.'
    return false
  }
  return true
}

const handleSaveDraft = async () => {
  isSubmitting.value = true
  submitError.value  = null
  try {
    // Call the auto-save function with API endpoint
    await api.post(`/hodnotenie/${application.id}/draft`, {
      criteria: scoringForm.criteria,
      internalNote: scoringForm.internalNote,
      recommendation: scoringForm.recommendation,
      requestSupplement: scoringForm.requestSupplement,
      supplementNote: scoringForm.supplementNote,
    })
    lastAutoSaveTime.value = new Date().toLocaleTimeString('sk-SK')
    // Show success toast
    useToast().addToast({
      message: 'Rozpracované hodnotenie bolo uložené',
      type: 'success',
    })
  } catch (error) {
    submitError.value = 'Nastala chyba pri ukladaní. Skúste znova.'
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  if (!validate()) return
  isSubmitting.value = true
  submitError.value  = null
  try {
    // TODO: await api.post(`/hodnotenie/${application.id}/submit`, scoringForm)
    await new Promise(r => setTimeout(r, 800))
    isSubmitted.value = true
    application.status = 'evaluating' // stays evaluating until all commission members submit
    // Update own score in commission list
    const me = application.commissionMembers.find(m => m.id === 20)
    if (me) me.score = totalScore.value
  } catch {
    submitError.value = 'Nastala chyba pri odosielaní. Skúste znova.'
  } finally {
    isSubmitting.value = false
  }
}
</script>