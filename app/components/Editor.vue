<template>
  <Editor
    v-model="content"
    :init="editorConfig"
  />
</template>

<script setup lang="ts">
import Editor from '@hugerte/hugerte-vue'
import { ref } from 'vue'

const content = defineModel<string>({ default: '' })

const editorConfig = {
  height: 600,
  plugins: [
    'lists',
    'link',
    'code',
    'searchreplace',
    'wordcount',
    'fullscreen',
    'table',
    'codesample',
    'charmap',
    'anchor',
    'directionality',
    'visualblocks',
    'visualchars',
    'nonbreaking',
    'quickbars',
  ].join(' '),

  toolbar: [
    'undo redo',
    'styles',
    'bold italic underline strikethrough',
    'forecolor backcolor',
    'alignleft aligncenter alignright alignjustify',
    'bullist numlist outdent indent',
    'blockquote hr',
    'link anchor',
    'table codesample charmap',
    'removeformat',
    'searchreplace wordcount',
    'fullscreen code',
  ].join(' | '),

  toolbar_mode: 'sliding',
  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
  quickbars_insert_toolbar: false,

  style_formats: [
    { title: 'Heading 1', block: 'h1' },
    { title: 'Heading 2', block: 'h2' },
    { title: 'Heading 3', block: 'h3' },
    { title: 'Heading 4', block: 'h4' },
    { title: 'Paragraph', block: 'p' },
    { title: 'Quote', block: 'blockquote' },
    { title: 'Code block', block: 'pre' },
    { title: 'Small text', inline: 'small' },
    { title: 'Lead paragraph', block: 'p', classes: 'lead' },
  ],

  content_style: `
    body {
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 15px;
      line-height: 1.7;
      max-width: 780px;
      margin: 1rem auto;
      color: #1e293b;
      padding-left: 0.5rem; /* add input-like padding so caret is visible */
      caret-color: #0f172a; /* ensure caret contrasts against background */
    }
    h1, h2, h3, h4 { font-weight: 700; line-height: 1.3; margin-top: 1.5em; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    blockquote {
      border-left: 4px solid #6366f1;
      margin: 1em 0;
      padding: .5em 1em;
      background: #f8f8ff;
      color: #475569;
    }
    code {
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: .9em;
    }
    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 1em;
      border-radius: 8px;
      overflow-x: auto;
    }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #cbd5e1; padding: 8px 12px; }
    th { background: #f1f5f9; font-weight: 600; }
    p.lead { font-size: 1.2em; color: #475569; }
    hr { border: none; border-top: 2px solid #e2e8f0; margin: 2em 0; }
  `,

  link_default_target: '_blank',
  link_assume_external_targets: true,

  table_toolbar: [
    'tableprops tabledelete',
    'tableinsertrowbefore tableinsertrowafter tabledeleterow',
    'tableinsertcolbefore tableinsertcolafter tabledeletecol',
  ].join(' | '),

  nonbreaking_force_tab: true,
  branding: false,
  promotion: false,
  statusbar: true,
}
</script>