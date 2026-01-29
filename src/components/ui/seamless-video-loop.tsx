'use client'

import { useEffect, useRef, useState } from 'react'

interface SeamlessVideoLoopProps {
  src: string
  poster?: string
  opacity?: number
  className?: string
}

export function SeamlessVideoLoop({ src, poster, opacity = 0.6, className = '' }: SeamlessVideoLoopProps) {
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1)

  useEffect(() => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current

    if (!video1 || !video2) return

    // Configurar eventos para transición ultra suave
    const handleTimeUpdate1 = () => {
      // Comenzar transición 3 segundos antes del final
      if (video1.duration - video1.currentTime < 3) {
        video2.currentTime = 0
        video2.play()
        setActiveVideo(2)
      }
    }

    const handleTimeUpdate2 = () => {
      // Comenzar transición 3 segundos antes del final
      if (video2.duration - video2.currentTime < 3) {
        video1.currentTime = 0
        video1.play()
        setActiveVideo(1)
      }
    }

    video1.addEventListener('timeupdate', handleTimeUpdate1)
    video2.addEventListener('timeupdate', handleTimeUpdate2)

    // Iniciar primer video
    video1.play()

    return () => {
      video1.removeEventListener('timeupdate', handleTimeUpdate1)
      video2.removeEventListener('timeupdate', handleTimeUpdate2)
    }
  }, [])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={video1Ref}
        muted
        playsInline
        preload="metadata"
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover video-hero-style"
        style={{
          opacity: activeVideo === 1 ? opacity : 0,
          transition: 'opacity 3s ease-in-out',
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <video
        ref={video2Ref}
        muted
        playsInline
        preload="none"
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover video-hero-style"
        style={{
          opacity: activeVideo === 2 ? opacity : 0,
          transition: 'opacity 3s ease-in-out',
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}
