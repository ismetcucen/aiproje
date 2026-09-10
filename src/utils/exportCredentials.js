import { VISUAL_PASSWORDS } from '../components/admin/AddStudentModal';

export function exportStudentCredentials(students, className = 'Sınıf') {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>${className} - Öğrenci Giriş Bilgileri</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .school { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 8px; }
        .name { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        .info-row { display: flex; align-items: center; margin-bottom: 12px; }
        .label { width: 70px; font-size: 12px; color: #64748b; font-weight: 600; }
        .value { font-family: monospace; font-size: 14px; background: #f8fafc; padding: 4px 8px; border-radius: 6px; border: 1px solid #e2e8f0; flex: 1; }
        .visual-pass { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: bold; color: #334155; }
        .icon { font-size: 24px; }
        .warning { font-size: 11px; color: #ef4444; margin-top: 12px; font-style: italic; }
        @media print {
          body { background: white; padding: 0; }
          .card { break-inside: avoid; border: 2px dashed #cbd5e1; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <h1 style="text-align: center; color: #0f172a; margin-bottom: 30px;">${className} - Öğrenci Giriş Kartları</h1>
      <div style="text-align: center; margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">🖨️ Yazdır / PDF Olarak Kaydet</button>
      </div>
      <div class="grid">
        ${students.map(s => {
          const v = s.visualId ? VISUAL_PASSWORDS.find(x => x.id === s.visualId) : null;
          const pass = v ? (s.email.startsWith('std_') ? `vp_${s.visualId}_2026!` : `${s.visualId}_123456`) : '(Gizli Şifre)';
          
          return `
          <div class="card">
            <div class="school">OHEP AI Studio</div>
            <h2 class="name">${s.fullName}</h2>
            
            ${v ? `
              <div style="text-align: center; margin-bottom: 16px;">
                <div class="icon" style="font-size: 48px; margin-bottom: 4px;">${v.icon}</div>
                <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Görsel Şifre: ${v.label}</div>
              </div>
            ` : ''}

            <div class="info-row">
              <span class="label">İsim:</span>
              <span class="value">${s.fullName}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Kullanıcı:</span>
              <span class="value" style="font-size:12px;">${s.email.split('@')[0]}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Şifre:</span>
              <span class="value" style="letter-spacing: 1px;">${pass}</span>
            </div>
            
            <div class="warning">
              ${!v ? '* Bu öğrenci standart şifreyle kayıt olmuştur, şifresi sistemde gizlidir.' : '* Panele giriş yaparken "Görsel Şifre" sekmesinden isminizi ve resminizi seçin.'}
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OHEP_Ogrenci_Sifreleri_${className.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
