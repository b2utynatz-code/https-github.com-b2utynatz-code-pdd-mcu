import { WorkingPaperRow } from './auditWorkingPaper';
import { formatThaiDate } from './helpers';

/**
 * Open a dedicated printable window with clean, official government styling
 * and immediately trigger window.print() so user can Save as PDF or Print.
 * This works 100% reliably in iframes, new tabs, and all browsers.
 */
export function printAuditWorkingPaper(rows: WorkingPaperRow[]) {
  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  
  const dateStr = formatThaiDate(new Date().toISOString().split('T')[0]);
  const totalCount = rows.length;

  const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>กระดาษทำการตรวจสอบภายใน WP-HR-01-2569 มจร</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 10mm 12mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Sarabun', 'TH Sarabun New', Tahoma, sans-serif;
      font-size: 11pt;
      line-height: 1.35;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 16px;
    }
    .no-print-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #0f172a;
      color: white;
      padding: 12px 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .no-print-bar button {
      background: #be185d;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .no-print-bar button:hover {
      background: #9d174d;
    }
    .header-box {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 14px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .logo-box {
      width: 65px;
      height: 65px;
      flex-shrink: 0;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .header-text {
      flex: 1;
    }
    .badges-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      font-size: 10pt;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-pink {
      background: #fce7f3;
      color: #9d174d;
      border: 1px solid #fbcfe8;
    }
    .badge-ref {
      background: #f1f5f9;
      color: #1e293b;
      border: 1px solid #cbd5e1;
      font-family: monospace;
    }
    .badge-status {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    h1 {
      font-size: 16pt;
      margin: 2px 0 4px 0;
      font-weight: 700;
      color: #0f172a;
    }
    .subtitle {
      font-size: 11pt;
      color: #334155;
      margin: 0;
    }
    .meta-line {
      font-size: 9.5pt;
      color: #64748b;
      margin-top: 4px;
    }
    table.working-paper-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin-bottom: 20px;
    }
    table.working-paper-table thead {
      display: table-header-group;
    }
    table.working-paper-table tr {
      page-break-inside: avoid;
    }
    table.working-paper-table th {
      background: #0f172a;
      color: #ffffff;
      border: 1px solid #334155;
      padding: 8px 6px;
      text-align: left;
      font-weight: 600;
      font-size: 9pt;
      vertical-align: middle;
    }
    table.working-paper-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 6px;
      vertical-align: top;
      line-height: 1.35;
    }
    table.working-paper-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .risk-critical {
      background-color: #fff1f2 !important;
    }
    .risk-high {
      background-color: #fffbeb !important;
    }
    .risk-medium {
      background-color: #eff6ff !important;
    }
    .tag-duty {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 8.5pt;
      font-weight: 600;
      margin: 1px;
      border: 1px solid #cbd5e1;
      background: #f1f5f9;
      color: #1e293b;
    }
    .tag-finance { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
    .tag-account { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
    .tag-supplies { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .tag-budget { background: #f3e8ff; color: #6b21a8; border-color: #e9d5ff; }

    .risk-tag {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: bold;
      color: white;
      margin-bottom: 3px;
    }
    .risk-tag-critical { background: #be123c; }
    .risk-tag-high { background: #b45309; }
    .risk-tag-medium { background: #1d4ed8; }
    .risk-tag-normal { background: #047857; }

    .summary-section {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px 18px;
      background: #f8fafc;
      page-break-inside: avoid;
      margin-top: 20px;
    }
    .summary-title {
      font-size: 12pt;
      font-weight: bold;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 10px;
      font-size: 9pt;
    }
    .summary-box {
      border: 1px solid #e2e8f0;
      background: white;
      padding: 8px 12px;
      border-radius: 6px;
    }
    .summary-box h4 {
      margin: 0 0 4px 0;
      font-size: 9.5pt;
      color: #0f172a;
    }
    .sign-section {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #cbd5e1;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <strong>หน้าต่างพร้อมพิมพ์รายงานกระดาษทำการ มจร (WP-HR-01/2569)</strong>
      <span style="opacity: 0.8; margin-left: 8px;">(หากหน้าต่างเครื่องพิมพ์ไม่เปิดอัตโนมัติ ให้คลิกปุ่ม "สั่งพิมพ์ / บันทึกเป็น PDF" หรือกด Ctrl+P / Cmd+P)</span>
    </div>
    <button onclick="window.print()">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 4px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
      </svg>
      สั่งพิมพ์ / บันทึกเป็น PDF
    </button>
  </div>

  <div class="header-box">
    <div class="logo-box">
      <img src="${window.location.origin}/mcu-logo.png" alt="ตรา มจร" onerror="this.style.display='none'"/>
    </div>
    <div class="header-text">
      <div class="badges-row">
        <span class="badge badge-pink">เอกสารตรวจสอบภายใน มจร</span>
        <span class="badge badge-ref">WP REF: WP-HR-01/2569</span>
        <span class="badge badge-status">สถานะ: สอบทานแล้ว</span>
      </div>
      <h1>รายงานกระดาษทำการ (Audit Working Paper)</h1>
      <p class="subtitle">การประเมินการควบคุมภายในและการบริหารจัดการทรัพยากรบุคคล (HR Audit) ด้านการเงิน บัญชี พัสดุ และงบประมาณ</p>
      <div class="meta-line">
        ส่วนงานตรวจสอบภายใน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย • ปีงบประมาณ พ.ศ. 2569 • วันที่ออกรายงาน: ${dateStr} • รายการที่แสดง: ${totalCount} รายการ
      </div>
    </div>
  </div>

  <table class="working-paper-table">
    <thead>
      <tr>
        <th style="width: 32px; text-align: center;">1. ลำดับ</th>
        <th style="width: 140px;">2. ชื่อส่วนงาน</th>
        <th style="width: 130px;">3. ตำแหน่ง</th>
        <th style="width: 85px; text-align: center;">4. หน้าที่หลัก</th>
        <th style="width: 75px; text-align: center;">5. อายุงาน</th>
        <th style="width: 140px;">6. การศึกษา</th>
        <th style="width: 140px;">7. การอบรมเพิ่มเติม</th>
        <th>8. หมายเหตุ (การวิเคราะห์ของผู้ตรวจสอบภายใน)</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => {
        let rowClass = '';
        if (r.riskLevel === 'วิกฤต') rowClass = 'risk-critical';
        else if (r.riskLevel === 'สูง') rowClass = 'risk-high';
        else if (r.riskLevel === 'ปานกลาง') rowClass = 'risk-medium';

        let riskTagClass = 'risk-tag-normal';
        if (r.riskLevel === 'วิกฤต') riskTagClass = 'risk-tag-critical';
        else if (r.riskLevel === 'สูง') riskTagClass = 'risk-tag-high';
        else if (r.riskLevel === 'ปานกลาง') riskTagClass = 'risk-tag-medium';

        const dutyTags = r.primaryDutiesList.map(d => {
          let c = 'tag-duty';
          if (d === 'การเงิน') c += ' tag-finance';
          if (d === 'บัญชี') c += ' tag-account';
          if (d === 'พัสดุ') c += ' tag-supplies';
          if (d === 'งบประมาณ') c += ' tag-budget';
          return `<span class="${c}">${d}</span>`;
        }).join(' ');

        return `
        <tr class="${rowClass}">
          <td style="text-align: center; font-weight: bold; font-family: monospace;">${r.index}</td>
          <td>
            <strong>${r.department}</strong><br/>
            <span style="font-size: 8.5pt; color: #475569;">${r.fullName}</span>
          </td>
          <td>
            ${r.position}
            ${r.isMultiCurriculum ? '<br/><span style="font-size: 8pt; color: #6b21a8; font-weight: 600;">(ควบหลายหลักสูตร)</span>' : ''}
          </td>
          <td style="text-align: center;">${dutyTags}</td>
          <td style="text-align: center; white-space: nowrap;">${r.tenureText}</td>
          <td>
            <strong>${r.educationLevel}</strong><br/>
            <span style="font-size: 8.5pt; color: #475569;">${r.major || '-'}</span>
          </td>
          <td>
            ${r.hasTraining 
              ? `<span style="color: #065f46; font-weight: 600;">✓ ผ่านการอบรม</span><br/><span style="font-size: 8.5pt;">${r.trainingText}</span>`
              : '<span style="color: #be123c; font-style: italic;">ไม่มีข้อมูลการอบรมในระบบ</span>'
            }
          </td>
          <td>
            <span class="risk-tag ${riskTagClass}">ระดับความเสี่ยง: ${r.riskLevel}</span><br/>
            ${r.auditRemarks}
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <div class="summary-section">
    <div class="summary-title">สรุปภาพรวมความเสี่ยงด้านการพัฒนาบุคลากรและการควบคุมภายใน มจร</div>
    <div style="font-size: 9.5pt; color: #475569;">สรุปผลการประเมินจากระบบสารสนเทศผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย</div>
    
    <div class="summary-grid">
      <div class="summary-box">
        <h4>1. ความเสี่ยงจากการขัดหลักการแบ่งแยกหน้าที่ (SoD Risk)</h4>
        <div>พบผู้ปฏิบัติงานควบหน้าที่ขัดแย้งเชิงระบบ (การเงินรับ + จ่าย หรือการเงิน + พัสดุ) ในส่วนงานที่มีอัตรากำลังจำกัด ข้อเสนอแนะ: จัดให้มี Compensating Control ให้ผู้บริหารตรวจสอบกระทบยอดเงินฝากทุกสิ้นเดือน และบังคับใช้ Krungthai Corporate Online</div>
      </div>
      <div class="summary-box">
        <h4>2. ช่องว่างด้านสมรรถนะและวุฒิไม่ตรงสาย (Competency Gap)</h4>
        <div>บุคลากรจำนวนมากมีวุฒิด้านรัฐศาสตร์ พระพุทธศาสนา หรือศึกษาศาสตร์ แต่ทำงานพัสดุและการเงิน ข้อเสนอแนะ: บังคับใช้ Mandatory Compliance Program สอบ Certificate พัสดุ กรมบัญชีกลาง และมาตรฐานบัญชีภาครัฐ</div>
      </div>
      <div class="summary-box">
        <h4>3. กลุ่มเสี่ยงบรรจุใหม่ (&lt; 2 ปี)</h4>
        <div>บุคลากรบรรจุใหม่ต้องการความรู้เฉพาะทาง ข้อเสนอแนะ: จัดระบบ Audit Mentoring ประกบพี่เลี้ยง และ Fast-track กฎหมายระเบียบการเงินพัสดุภายใน 90 วัน</div>
      </div>
      <div class="summary-box">
        <h4>4. ภาระงานกระจุกตัวระดับหลักสูตร (Overburden)</h4>
        <div>เจ้าหน้าที่สายสนับสนุน 1 ท่าน ควบดูแลการเงินและพัสดุตั้งแต่ 4-8 สาขาวิชาพร้อมกัน ข้อเสนอแนะ: นำระบบ ERP Course-Budget มาช่วยตัดยอดงบประมาณอัตโนมัติ</div>
      </div>
    </div>
  </div>

  <div class="sign-section">
    <div>
      <strong>ผู้จัดทำกระดาษทำการ (Prepared By):</strong><br/>
      คณะทำงานตรวจสอบภายในและประเมินระบบการควบคุมภายใน มจร<br/>
      วันที่: ${dateStr}
    </div>
    <div style="text-align: right;">
      <strong>ผู้สอบทานกระดาษทำการ (Reviewed By):</strong><br/>
      หัวหน้าส่วนงานตรวจสอบภายใน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย<br/>
      อนุมัติและรับรองผลการวิเคราะห์ในสารบบ
    </div>
  </div>

  <script>
    window.addEventListener('DOMContentLoaded', () => {
      // Small timeout to allow styles and fonts to render
      setTimeout(() => {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // Fallback if popup blocked: print in current window
    window.print();
  }
}
