import { writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import JSZip from 'jszip'

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

const paragraph = text => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`
const paragraphAfterPageBreak = text => `<w:p><w:r><w:lastRenderedPageBreak/><w:t>${text}</w:t></w:r></w:p>`

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraph('This is a Datashare test document.')}
    ${paragraph('It holds a needle to find.')}
    ${paragraphAfterPageBreak('This paragraph opens the second page.')}
    ${paragraph('Crème brûlée closes it.')}
  </w:body>
</w:document>`

const zip = new JSZip()
zip.file('[Content_Types].xml', contentTypes)
zip.folder('_rels').file('.rels', rels)
zip.folder('word').file('document.xml', documentXml)

const buffer = await zip.generateAsync({ type: 'nodebuffer' })
const output = resolve(dirname(fileURLToPath(import.meta.url)), '../tests/unit/resources/document.docx')
writeFileSync(output, buffer)
