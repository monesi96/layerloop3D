import '../app/css/home.css'
import '../app/css/design.css'
import '../app/css/blocks.css'
import {Shell, Raw, loadShared} from './shell'
import {headerHtml, footerHtml} from './templates'

/** Contenitore delle pagine alimentate da blocchi / articoli / liste. */
export async function PageShell({children, active}: {children: React.ReactNode; active?: string}) {
  const {settings, printers, sectors, materials, cases} = await loadShared()
  return (
    <Shell header={headerHtml(settings, printers, sectors, materials, cases, {active})} footer={footerHtml(settings)}>
      <main id="top" className="pg">{children}</main>
    </Shell>
  )
}
