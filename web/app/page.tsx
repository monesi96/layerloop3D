import './css/home.css'
import './css/design.css'
import {Shell, Raw, fragment, loadShared} from '@/lib/shell'
import {pressHtml, headerHtml, footerHtml, printersHtml, sectorsHtml, materialsHtml, casesHtml} from '@/lib/templates'

export const revalidate = 60

export default async function Home() {
  const {settings, printers, sectors, materials, cases} = await loadShared()
  const html = fragment('home')
    .replace('<!--@header-->', '')
    .replace('<!--@footer-->', '')
    .replace('<!--@press-->', pressHtml(settings))
    .replace('<!--@printers-->', printersHtml(printers))
    .replace('<!--@sectors-->', sectorsHtml(sectors))
    .replace('<!--@materials-->', materialsHtml(materials))
    .replace('<!--@cases-->', casesHtml(cases))
  return (
    <>
      <script dangerouslySetInnerHTML={{__html: "document.body.classList.add('lock')"}} />
      <Shell header={headerHtml(settings, printers, sectors, materials, cases, {home: true})} footer={footerHtml(settings)} scripts={['/js/home.js']}>
        <Raw html={html} />
      </Shell>
    </>
  )
}
