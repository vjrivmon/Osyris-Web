"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  FileText,
  Calendar,
  MessageSquare,
  ChevronLeft,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AulaVirtualSidebarProps {
  collapsed: boolean
  onToggle: () => void
  isAdmin?: boolean
}

export function AulaVirtualSidebar({ collapsed, onToggle, isAdmin = false }: AulaVirtualSidebarProps) {
  const pathname = usePathname()

  const navigationItems = [
    {
      href: "/aula-virtual",
      icon: Home,
      label: "INICIO",
      id: "inicio"
    },
    {
      href: "/aula-virtual/documentos",
      icon: FileText,
      label: "DOCUMENTOS",
      id: "documentos"
    },
    {
      href: "/aula-virtual/calendario",
      icon: Calendar,
      label: "CALENDARIO",
      id: "calendario"
    },
    {
      href: "/aula-virtual/comunicaciones",
      icon: MessageSquare,
      label: "COMUNICACIONES",
      id: "comunicaciones"
    }
  ]

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Navegación principal"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img
              src="/images/logo-osyris.png"
              alt="Logo Grupo Scout Osyris"
              className="h-8 w-8 rounded-full border-2 border-primary"
            />
            <span className="font-semibold text-sm">Aula Virtual</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-2" role="menubar">
        {navigationItems.map((item) => {
          const isActive = item.href === "/aula-virtual"
            ? pathname === "/aula-virtual"
            : pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-1",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive && "bg-primary/10 text-primary",
                collapsed && "justify-center"
              )}
              role="menuitem"
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              >
              <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      {/* Footer - Removed logout button as it's now in the top toolbar */}
    </div>
  );
}