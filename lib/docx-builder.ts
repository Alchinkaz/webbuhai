import { Document, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun, BorderStyle } from "docx"

interface InvoiceData {
  // Payment order
  beneficiary: string
  iin_bin: string
  iik: string
  kbe: string
  bank: string
  bik: string
  payment_code: string

  // Invoice header
  invoice_number: string
  invoice_date: string

  // Parties
  supplier: string
  supplier_iin: string
  customer_name: string
  customer_iin: string
  contract: string

  // Table rows
  TABLE_ROWS: Array<{
    code: string
    name: string
    quantity: string
    unit: string
    price: string
    total: string
  }>

  // Totals
  total: string
  vat: string
  total_text: string
  executor: string
}

export function buildInvoiceDocument(data: InvoiceData): Document {
  console.log("[v0] Building invoice document programmatically")

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Warning text
          new Paragraph({
            children: [
              new TextRun({
                text: "Внимание! Оплата данного счета означает согласие с условиями поставки товара. Уведомление об оплате обязательно, в противном случае не гарантируется наличие товара на складе. Товар отпускается по факту прихода денег на р/с Поставщика, самовывозом, при наличии доверенности и документов удостоверяющих личность.",
                font: "Arial",
                size: 18, // 9pt = 18 half-points
              }),
            ],
            spacing: { after: 200 },
          }),

          // Payment order header
          new Paragraph({
            children: [
              new TextRun({
                text: "Образец платежного поручения",
                font: "Arial",
                size: 28, // 14pt = 28 half-points
                bold: true,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),

          // Payment order table
          createPaymentOrderTable(data),

          // Invoice header
          new Paragraph({
            children: [
              new TextRun({
                text: `Счет на оплату № ${data.invoice_number} от ${data.invoice_date}`,
                font: "Arial",
                size: 32, // 16pt = 32 half-points
                bold: true,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          // Supplier info
          new Paragraph({
            children: [
              new TextRun({ text: "Поставщик: ", bold: true, font: "Arial", size: 22 }),
              new TextRun({ text: data.supplier, font: "Arial", size: 22 }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "ИИН/БИН: ", bold: true, font: "Arial", size: 22 }),
              new TextRun({ text: data.supplier_iin, font: "Arial", size: 22 }),
            ],
            spacing: { after: 100 },
          }),

          // Customer info
          new Paragraph({
            children: [
              new TextRun({ text: "Покупатель: ", bold: true, font: "Arial", size: 22 }),
              new TextRun({ text: data.customer_name, font: "Arial", size: 22 }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "ИИН/БИН: ", bold: true, font: "Arial", size: 22 }),
              new TextRun({ text: data.customer_iin, font: "Arial", size: 22 }),
            ],
            spacing: { after: 100 },
          }),

          // Contract
          new Paragraph({
            children: [
              new TextRun({ text: "Договор: ", bold: true, font: "Arial", size: 22 }),
              new TextRun({ text: data.contract, font: "Arial", size: 22 }),
            ],
            spacing: { after: 200 },
          }),

          // Items table
          createItemsTable(data),

          // Totals
          new Paragraph({
            children: [
              new TextRun({ text: "Итого: ", bold: true, font: "Arial", size: 22 }),
              new TextRun({ text: data.total, font: "Arial", size: 22 }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100, after: 50 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "В том числе НДС: ", bold: true, font: "Arial", size: 22 }),
              new TextRun({ text: data.vat, font: "Arial", size: 22 }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),

          // Total in words
          new Paragraph({
            children: [
              new TextRun({
                text: `Всего наименований ${data.TABLE_ROWS.length}, на сумму ${data.total} KZT`,
                font: "Arial",
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Всего к оплате: ", bold: true, font: "Arial", size: 22 }),
              new TextRun({ text: data.total_text, font: "Arial", size: 22 }),
            ],
            spacing: { after: 200 },
          }),

          // Executor
          new Paragraph({
            children: [
              new TextRun({
                text: "Исполнитель _____________________________________ / ",
                font: "Arial",
                size: 22,
              }),
              new TextRun({ text: data.executor, font: "Arial", size: 22 }),
            ],
            spacing: { before: 200 },
          }),

          new Paragraph({
            children: [new TextRun({ text: "М.П.", font: "Arial", size: 22 })],
            spacing: { before: 100 },
          }),
        ],
      },
    ],
  })

  console.log("[v0] Document built successfully")
  return doc
}

function createPaymentOrderTable(data: InvoiceData): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Row 1
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Бенефициар:", bold: true, font: "Arial", size: 20 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: data.beneficiary, font: "Arial", size: 20 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: `БИН: ${data.iin_bin}`, font: "Arial", size: 20 })],
              }),
            ],
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "ИИК", bold: true, font: "Arial", size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [new TextRun({ text: data.iik, font: "Arial", size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "КБе", bold: true, font: "Arial", size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [new TextRun({ text: data.kbe, font: "Arial", size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
        ],
      }),
      // Row 2
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Банк бенефициара:", bold: true, font: "Arial", size: 20 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: data.bank, font: "Arial", size: 20 })],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "БИК", bold: true, font: "Arial", size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [new TextRun({ text: data.bik, font: "Arial", size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Код назначения платежа", bold: true, font: "Arial", size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [new TextRun({ text: data.payment_code, font: "Arial", size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
        ],
      }),
    ],
  })
}

function createItemsTable(data: InvoiceData): Table {
  // Header row
  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "№", bold: true, font: "Arial", size: 20 })],
            alignment: AlignmentType.CENTER,
          }),
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Код", bold: true, font: "Arial", size: 20 })],
            alignment: AlignmentType.CENTER,
          }),
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Наименование", bold: true, font: "Arial", size: 20 })],
            alignment: AlignmentType.CENTER,
          }),
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Кол-во", bold: true, font: "Arial", size: 20 })],
            alignment: AlignmentType.CENTER,
          }),
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Ед. изм.", bold: true, font: "Arial", size: 20 })],
            alignment: AlignmentType.CENTER,
          }),
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Цена за ед.", bold: true, font: "Arial", size: 20 })],
            alignment: AlignmentType.CENTER,
          }),
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Сумма", bold: true, font: "Arial", size: 20 })],
            alignment: AlignmentType.CENTER,
          }),
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      }),
    ],
  })

  // Data rows - dynamically create based on TABLE_ROWS
  const dataRows = data.TABLE_ROWS.map((row, index) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: String(index + 1), font: "Arial", size: 20 })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: row.code, font: "Arial", size: 20 })],
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: row.name, font: "Arial", size: 20 })],
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: row.quantity, font: "Arial", size: 20 })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: row.unit, font: "Arial", size: 20 })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: row.price, font: "Arial", size: 20 })],
              alignment: AlignmentType.RIGHT,
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: row.total, font: "Arial", size: 20 })],
              alignment: AlignmentType.RIGHT,
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
      ],
    })
  })

  console.log(`[v0] Created ${dataRows.length} table rows`)

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  })
}
