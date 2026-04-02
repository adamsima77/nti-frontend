export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  registered: string
  is_anonymized?: boolean
}

export interface AdminApplication {
  id: number
  appId: string
  team: string
  call: string
  program: string
  status: string
  date: string
  mentor?: { id: number; name: string } | null
  product_owner?: { id: number; name: string } | null
}

export interface MentorOption {
  id: number
  name: string
  email: string
}
