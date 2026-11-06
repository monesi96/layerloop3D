import {esc} from './templates'

/** Pose camera per ogni passo della scena 3D di Next (indice 0 = panoramica iniziale).
 *  [theta°, phi°, raggio m, target x, y, z (m), fov°]. Modello in metri, Y su, fronte della macchina = +X. */
export const NEXT_POSES: number[][] = [
  // [theta°, phi°, raggio m, target x, y, z (m), fov°, opacità carrozzeria 0-1]
  [128, 76, 3.3, 0, 0.7, 0, 30, 1], // panoramica
  [80, 78, 1.2, 0.34, 1.26, 0, 28, 1], // touchscreen
  [72, 80, 1.05, 0.34, 0.86, 0, 28, 1], // camera con finestra
  [58, 56, 0.42, 0.206, 1.17, -0.1, 22, 0.08], // testa di stampa (carrozzeria trasparente)
  [66, 66, 0.95, 0.235, 0.86, 0, 26, 0.08], // rullo di stampa
  [40, 50, 1.25, 0.03, 0.84, 0, 28, 0.08], // calibrazione / piano
  [4, 88, 1.75, 0.04, 1.08, -0.1, 28, 0.08], // asse inclinato 30° (fianco)
  [132, 80, 2.3, 0, 0.42, 0, 30, 1], // cabinet / banco
]

export function scene3dHtml(model: string, poster: string, steps: {title: string; text: string}[], poses = NEXT_POSES) {
  const all = [{title: 'Dentro la macchina.', text: 'Scorri: la camera entra nella Layerloop Next e ti porta fino alle sue parti.'}, ...steps]
  const n = all.length
  const panes = all.map((s, i) => `<div class="m3-pane${i === 0 ? ' on' : ''}" data-i="${i}"><span class="m3-k">${String(i).padStart(2, '0')} / ${String(n - 1).padStart(2, '0')}</span><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p></div>`).join('')
  const dots = all.map((s, i) => `<li><button type="button" class="m3-dot${i === 0 ? ' on' : ''}" data-i="${i}" aria-label="${esc(s.title)}"></button></li>`).join('')
  return `<section class="m3" id="tour3d" data-n="${n}" data-poses="${esc(JSON.stringify(poses))}" style="--n:${n}">
<div class="m3-pin">
<model-viewer id="m3v" src="${esc(model)}" poster="${esc(poster)}" alt="Modello 3D di Layerloop Next" disable-zoom disable-pan interaction-prompt="none" shadow-intensity="1.4" shadow-softness="1" exposure="0.72" tone-mapping="aces" environment-image="neutral" camera-orbit="38deg 74deg 3.3m" camera-target="0m 0.7m 0m" field-of-view="30deg" min-camera-orbit="-Infinity 5deg 0.15m" max-camera-orbit="Infinity 175deg 8m" min-field-of-view="8deg" max-field-of-view="50deg" reveal="auto" loading="eager"></model-viewer>
<div class="m3-ui">${panes}</div>
<ol class="m3-dots" aria-label="Passi">${dots}</ol>
<div class="m3-hint" aria-hidden="true"><span></span>Scorri</div>
</div>
<script type="module">import "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";</script></section>`
}
