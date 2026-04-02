export interface HeroBlockData {
  title: string
  description: string
  primaryCtaText?: string
  primaryCtaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  backgroundImage?: string
}

export interface TextBlockData {
  heading?: string
  content: string
  alignment?: 'left' | 'center' | 'right'
}

export interface CtaBlockData {
  title: string
  description?: string
  buttonText: string
  buttonLink: string
  variant?: 'primary' | 'outline'
  backgroundClass?: string
}

export interface FaqBlockData {
  title?: string
  items: Array<{ question: string; answer: string; category?: string }>
}

export interface PartnersBlockData {
  title?: string
  partners: Array<{ name: string; logoUrl: string; website?: string }>
}

export type BlockType = 'HeroBlock' | 'TextBlock' | 'CtaBlock' | 'FaqBlock' | 'PartnersBlock'

export interface CmsBlock {
  id: string | number
  type: BlockType
  content: HeroBlockData | TextBlockData | CtaBlockData | FaqBlockData | PartnersBlockData
  order: number
}

export interface CmsPage {
  id: number
  title: string
  slug: string
  status: 'active' | 'draft'
  blocks: CmsBlock[]
  updated_at?: string
}

export interface CmsBanner {
  id: number
  title: string
  description?: string
  buttonText: string
  buttonLink: string
  variant: 'primary' | 'outline'
  status: 'active' | 'draft'
  placement?: string
  updated_at?: string
}
