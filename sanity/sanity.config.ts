import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'layerloop',
  title: 'Layerloop',
  projectId: 'ip459cev',
  dataset: 'layerloop',
  plugins: [structureTool({structure}), visionTool()],
  schema: {types: schemaTypes},
})
