'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/familiares', label: 'Familias', icon: UsersRound },
  { href: '/admin/system', label: 'Sistema', icon: Settings },
]

export function AdminNavTabs() {
  const pathname = usePathname()

  return (
    <nav
      className="hidden md:flex items-center gap-1"
      role="navigation"
      aria-label="Navegacion principal admin"
    >
      {navItems.map(item => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
