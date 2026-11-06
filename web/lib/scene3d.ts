import {esc} from './templates'

/** Pose camera per ogni passo della scena 3D di Next (indice 0 = panoramica iniziale).
 *  [theta°, phi°, raggio m, target x, y, z (m), fov°]. Modello in metri, Y su, fronte della macchina = +X. */
export const NEXT_POSES: number[][] = [
  [38, 72, 2.4, 0, 0.3, 0, 30], // panoramica
  [78, 76, 1.1, 0.36, 0.52, 0, 28], // touchscreen
  [68, 82, 1.35, 0.2, 0.3, 0, 30], // camera con finestra
  [52, 68, 0.7, 0.25, 0.43, -0.1, 28], // testa di stampa
  [78, 80, 1.0, 0.2, 0.12, 0, 30], // rullo di stampa
  [40, 52, 1.2, 0.0, 0.1, 0, 30], // calibrazione / piano
  [6, 86, 2.0, 0, 0.3, 0, 30], // asse inclinato 30° (fianco)
  [214, 96, 2.5, 0, 0.12, 0, 32], // cabinet / retro
]

export function scene3dHtml(model: string, poster: string, steps: {title: string; text: string}[], poses = NEXT_POSES) {
  const all = [{title: 'Dentro la macchina.', text: 'Scorri: la camera entra nella Layerloop Next e ti porta fino alle sue parti.'}, ...steps]
  const n = all.length
  const panes = all.map((s, i) => `<div class="m3-pane${i === 0 ? ' on' : ''}" data-i="${i}"><span class="m3-k">${String(i).padStart(2, '0')} / ${String(n - 1).padStart(2, '0')}</span><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p></div>`).join('')
  const dots = all.map((s, i) => `<li><button type="button" class="m3-dot${i === 0 ? ' on' : ''}" data-i="${i}" aria-label="${esc(s.title)}"></button></li>`).join('')
  return `<section class="m3" id="tour3d" data-n="${n}" data-poses="${esc(JSON.stringify(poses))}" style="--n:${n}">
<div class="m3-pin">
<model-viewer id="m3v" src="${esc(model)}" poster="${esc(poster)}" alt="Modello 3D di Layerloop Next" disable-zoom disable-pan interaction-prompt="none" shadow-intensity="1.4" shadow-softness="1" exposure="0.72" tone-mapping="aces" environment-image="neutral" camera-orbit="38deg 72deg 2.4m" camera-target="0m 0.3m 0m" field-of-view="30deg" min-camera-orbit="-Infinity 5deg 0.15m" max-camera-orbit="Infinity 175deg 8m" min-field-of-view="8deg" max-field-of-view="50deg" reveal="auto" loading="eager"></model-viewer>
<div class="m3-ui">${panes}</div>
<ol class="m3-dots" aria-label="Passi">${dots}</ol>
<div class="m3-hint" aria-hidden="true"><span></span>Scorri</div>
</div>
<script type="module">import "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";</script></section>`
}
