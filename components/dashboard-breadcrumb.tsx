"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function DashboardBreadcrumb() {
  const pathname = usePathname()

  if (!pathname.startsWith("/dashboard")) {
    return null
  }

  const segments = pathname.split("/").filter(Boolean)

  // Get user role from URL
  const userRole = segments[1] || ""

  // Create breadcrumb items
  const breadcrumbItems = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`

    // Format the segment for display
    let label = segment.charAt(0).toUpperCase() + segment.slice(1)

    // Special case for the dashboard segment
    if (segment === "dashboard") {
      label = "Dashboard"
    }

    return {
      href,
      label,
      isCurrent: index === segments.length - 1,
    }
  })

  return (
    <nav className="flex items-center text-sm text-muted-foreground">
      <Link
        href={`/dashboard/${userRole}`}
        className="flex items-center hover:text-foreground"
        >
        <Home className="h-4 w-4 mr-1" />
        <span className="sr-only sm:not-sr-only">Inicio</span>
      </Link>
      {breadcrumbItems.slice(1).map((item, index) => (
        <div key={item.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.isCurrent ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-foreground" >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

