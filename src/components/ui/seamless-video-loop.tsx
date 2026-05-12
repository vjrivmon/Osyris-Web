'use client'

interface SeamlessVideoLoopProps {
  src: string
  poster?: string
  opacity?: number
  className?: string
}

export function SeamlessVideoLoop({ src, poster, opacity = 0.6, className = '' }: SeamlessVideoLoopProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}
