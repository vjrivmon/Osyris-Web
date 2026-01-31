'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const ROLE_CONFIG: Record<string, { label: string; route: string }> = {
  familia: { label: 'Familia', route: '/familia/dashboard' },
  comite: { label: 'Comité', route: '/comite/dashboard' },
  admin: { label: 'Admin', route: '/admin' },
  scouter: { label: 'Aula Virtual', route: '/aula-virtual' },
}

export function RoleSwitcher() {
  const { activeRole, availableRoles, switchRole } = useAuth()
  const router = useRouter()

  // Only show if user has more than one role
  if (availableRoles.length <= 1) return null

  const handleSwitch = (newRole: string) => {
    if (newRole === activeRole) return
    switchRole(newRole)
    const config = ROLE_CONFIG[newRole]
    if (config) {
      router.push(config.route)
    }
  }

  return (
    <Tabs value={activeRole} onValueChange={handleSwitch}>
      <TabsList className="h-8 min-h-0 flex-nowrap p-0.5">
        {availableRoles.map((role) => {
          const config = ROLE_CONFIG[role]
          if (!config) return null
          return (
            <TabsTrigger
              key={role}
              value={role}
              className="h-7 px-2.5 text-xs font-medium"
            >
              {config.label}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
