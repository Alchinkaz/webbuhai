import PizZip from "pizzip"

export function generateSampleTemplate(): ArrayBuffer {
  console.log("[v0] Generating sample invoice template...")

  // Create a minimal Word document XML structure
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Внимание! Оплата данного счета означает согласие с условиями поставки товара.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Уведомление об оплате обязательно, в противном случае не гарантируется наличие товара на складе.</w:t></w:r></w:p>
    <w:p><w:r><w:t xmlSpace="preserve"> </w:t></w:r></w:p>
    
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>Образец платежного поручения</w:t></w:r></w:p>
    
    <w:tbl>
      <w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single"/><w:left w:val="single"/><w:bottom w:val="single"/><w:right w:val="single"/><w:insideH w:val="single"/><w:insideV w:val="single"/></w:tblBorders></w:tblPr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Бенефициар:</w:t></w:r></w:p><w:p><w:r><w:t>{COMPANY_NAME}</w:t></w:r></w:p><w:p><w:r><w:t>БИН: {COMPANY_IIN}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>ИИК</w:t></w:r></w:p><w:p><w:r><w:t>{COMPANY_IIC}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>КБе</w:t></w:r></w:p><w:p><w:r><w:t>{COMPANY_KBE}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Банк бенефициара:</w:t></w:r></w:p><w:p><w:r><w:t>{BENEFICIARY_BANK}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>БИК</w:t></w:r></w:p><w:p><w:r><w:t>{COMPANY_BIC}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Код назначения платежа</w:t></w:r></w:p><w:p><w:r><w:t>{PAYMENT_CODE}</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    
    <w:p><w:r><w:t xmlSpace="preserve"> </w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>Счет на оплату № {INVOICE_NUMBER} от {INVOICE_DATE}</w:t></w:r></w:p>
    <w:p><w:r><w:t xmlSpace="preserve"> </w:t></w:r></w:p>
    
    <w:p><w:r><w:t>Поставщик: {SUPPLIER_NAME}</w:t></w:r></w:p>
    <w:p><w:r><w:t>ИИН/БИН: {SUPPLIER_IIN}</w:t></w:r></w:p>
    <w:p><w:r><w:t xmlSpace="preserve"> </w:t></w:r></w:p>
    <w:p><w:r><w:t>Покупатель: {CLIENT_NAME}</w:t></w:r></w:p>
    <w:p><w:r><w:t>ИИН/БИН: {CLIENT_IIN}</w:t></w:r></w:p>
    <w:p><w:r><w:t xmlSpace="preserve"> </w:t></w:r></w:p>
    <w:p><w:r><w:t>Договор: {CONTRACT}</w:t></w:r></w:p>
    <w:p><w:r><w:t xmlSpace="preserve"> </w:t></w:r></w:p>
    
    <w:tbl>
      <w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single"/><w:left w:val="single"/><w:bottom w:val="single"/><w:right w:val="single"/><w:insideH w:val="single"/><w:insideV w:val="single"/></w:tblBorders></w:tblPr>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>№</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Код</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Наименование</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Кол-во</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Ед. изм.</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Цена за ед.</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Сумма</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>{#items}{number}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{code}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{name}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{quantity}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{unit}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{price}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{total}{/items}</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    
    <w:p><w:r><w:t xmlSpace="preserve"> </w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:t>Итого: {TOTAL_SUM}</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:t>В том числе НДС: {VAT}</w:t></w:r></w:p>
    <w:p><w:r><w:t xmlSpace="preserve"> </w:t></w:r></w:p>
    <w:p><w:r><w:t>{ITEMS_TOTAL_LINE}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Всего к оплате: {TOTAL_SUM_IN_WORDS}</w:t></w:r></w:p>
    <w:p><w:r><w:t xmlSpace="preserve"> </w:t></w:r></w:p>
    <w:p><w:r><w:t>Исполнитель _____________________________________ / {POSITION} {EXECUTOR_NAME}</w:t></w:r></w:p>
    <w:p><w:r><w:t>М.П.</w:t></w:r></w:p>
  </w:body>
</w:document>`

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

  // Create a ZIP file structure
  const zip = new PizZip()
  zip.file("word/document.xml", documentXml)
  zip.file("[Content_Types].xml", contentTypesXml)
  zip.file("_rels/.rels", relsXml)

  const buffer = zip.generate({
    type: "arraybuffer",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  })

  console.log("[v0] Sample template generated successfully")
  return buffer
}
