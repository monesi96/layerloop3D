import '../css/materiali.css'
import type {Metadata} from 'next'
import {Shell, Raw, fragment, loadShared} from '@/lib/shell'
import {headerHtml, footerHtml} from '@/lib/templates'

export const revalidate = 60
export const metadata: Metadata = {title: 'Materiali', description: 'I filamenti Layerloop per la stampa 3D industriale a nastro: dal PLA ai compositi in fibra di carbonio e ai polimeri ad alte temperature.'}

export default async function Materiali() {
  const {settings, printers, sectors, materials, cases} = await loadShared()
  const data = materials.map((m: any) => ({id: m.id, n: m.n, a: m.a, f: m.categories || [], c: m.colors || [], m: (m.m || []).map((x: string) => x.toUpperCase()), key: m.keyTrait, d: m.description, t: m.tags || []}))
  const html = fragment('materiali').replace('<!--@header-->', '').replace('<!--@footer-->', '')
  return (
    <>
      <script dangerouslySetInnerHTML={{__html: `window.__MATERIALS__=${JSON.stringify(data).replace(/</g, '\\u003c')}`}} />
      <Shell header={headerHtml(settings, printers, sectors, materials, cases, {active: 'materiali'})} footer={footerHtml(settings)} scripts={['/js/materiali.js']}>
        <Raw html={html} />
      </Shell>
    </>
  )
}
