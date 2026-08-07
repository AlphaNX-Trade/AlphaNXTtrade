// Utility functions to export reports in CSV, Excel, and PDF formats

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(filename: string, title: string, headers: string[], rows: (string | number)[][]) {
  // Creating an XML Excel spreadsheet format (supported natively by Excel)
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${title}">
  <Table>`;

  // Title Row
  xml += `<Row><Cell><Data ss:Type="String">${title} - AlphaNXT Financial Report</Data></Cell></Row>`;
  xml += `<Row><Cell><Data ss:Type="String">Generated: ${new Date().toLocaleString()}</Data></Cell></Row>`;
  xml += `<Row></Row>`;

  // Header Row
  xml += `<Row>`;
  headers.forEach((h) => {
    xml += `<Cell><Data ss:Type="String">${h}</Data></Cell>`;
  });
  xml += `</Row>`;

  // Data Rows
  rows.forEach((row) => {
    xml += `<Row>`;
    row.forEach((cell) => {
      const isNum = typeof cell === 'number';
      xml += `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${cell}</Data></Cell>`;
    });
    xml += `</Row>`;
  });

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printOrExportPDF(reportTitle: string, summaryStats: { label: string; value: string }[], headers: string[], rows: (string | number)[][]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const summaryHtml = summaryStats
    .map(
      (s) => `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; flex: 1;">
      <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">${s.label}</div>
      <div style="font-size: 18px; color: #0f172a; font-weight: bold; margin-top: 4px;">${s.value}</div>
    </div>
  `
    )
    .join('');

  const tableHeadersHtml = headers.map((h) => `<th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 12px;">${h}</th>`).join('');
  const tableRowsHtml = rows
    .map(
      (row) => `
    <tr>
      ${row.map((cell) => `<td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">${cell}</td>`).join('')}
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle} - AlphaNXT</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: 900; color: #0284c7; }
          .summary-grid { display: flex; gap: 12px; margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">AlphaNXT</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Smart Investor Financial Report</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            <div><strong>${reportTitle}</strong></div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="summary-grid">
          ${summaryHtml}
        </div>

        <table>
          <thead>
            <tr>${tableHeadersHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Report generated securely by AlphaNXT V8 Smart Investor Engine. Confidential to user account.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
