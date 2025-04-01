"use client"

import React from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Algo ha ido mal</h2>
          <p className="text-muted-foreground mb-4">
            Ha ocurrido un error al cargar este componente. Por favor, inténtalo de nuevo.
          </p>
          <Button onClick={() => this.setState({ hasError: false, error: null })}>Reintentar</Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

