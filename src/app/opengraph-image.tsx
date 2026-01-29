import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Grupo Scout Osyris - Educación Scout en Valencia'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a5632 0%, #2d8a4e 50%, #1a5632 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 50,
            }}
          >
            ⚜️
          </div>
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          Grupo Scout Osyris
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.85)',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Educación scout integral para jóvenes de 5 a 19 años en Valencia
        </div>
        <div
          style={{
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.6)',
            marginTop: 30,
          }}
        >
          gruposcoutosyris.es
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
