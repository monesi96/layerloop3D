'use client'
import {useEffect, useRef, useState} from 'react'

type Hotspot = {slot: string; position: string; normal?: string; label: string}

/** Visualizzatore 3D interattivo (glTF/GLB): ruota con il mouse, zoom, hotspot sulle parti della macchina. */
export default function ModelViewer({src, poster, alt, hotspots = []}: {src: string; poster?: string; alt: string; hotspots?: Hotspot[]}) {
  const [ready, setReady] = useState(false)
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    let alive = true
    import('@google/model-viewer').then(() => alive && setReady(true))
    return () => { alive = false }
  }, [])
  const MV: any = 'model-viewer'
  return (
    <div className="mv-wrap">
      {ready ? (
        <MV ref={ref} src={src} poster={poster} alt={alt} camera-controls="" auto-rotate="" auto-rotate-delay="2500" rotation-per-second="14deg"
            interaction-prompt="auto" shadow-intensity="1.1" shadow-softness="1" exposure="1.05" environment-image="neutral" tone-mapping="aces"
            camera-orbit="35deg 72deg auto" min-camera-orbit="auto auto auto" loading="lazy" reveal="auto" style={{width: '100%', height: '100%'}}>
          {hotspots.map((h) => (
            <button key={h.slot} slot={h.slot} className="mv-hs" data-position={h.position} data-normal={h.normal || '0m 1m 0m'}><span>{h.label}</span></button>
          ))}
        </MV>
      ) : poster ? <img src={poster} alt={alt} style={{width: '100%', height: '100%', objectFit: 'contain'}} /> : null}
    </div>
  )
}
