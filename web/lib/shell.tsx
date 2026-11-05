import fs from 'node:fs'
import path from 'node:path'
import {getSettings, getPrinters, getSectors, getMaterials, getCases} from './data'
import {headerHtml, footerHtml} from './templates'

export const Raw = ({html}: {html: string}) => <div style={{display: 'contents'}} dangerouslySetInnerHTML={{__html: html}} />

export const fragment = (name: string) => fs.readFileSync(path.join(process.cwd(), 'content', `${name}.html`), 'utf8')

export async function loadShared() {
  const [settings, printers, sectors, materials, cases] = await Promise.all([getSettings(), getPrinters(), getSectors(), getMaterials(), getCases()])
  return {settings, printers, sectors, materials, cases}
}

export const Scripts = ({files}: {files: string[]}) => (
  <>
    {files.map((f) => (
      <script key={f} src={f} defer />
    ))}
  </>
)

/** Struttura comune: header, contenuto, footer e script (Lenis -> site.js -> script di pagina). */
export function Shell({header, footer, children, scripts = []}: {header: string; footer: string; children: React.ReactNode; scripts?: string[]}) {
  return (
    <>
      <Raw html={header} />
      {children}
      <Raw html={footer} />
      <Scripts files={['/js/site.js', ...scripts]} />
    </>
  )
}
