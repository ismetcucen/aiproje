import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getProjectDraftsByStudent, deleteProjectAssistantDraft } from '../../firebase/schema';

export default function MyProjects({ onOpenProject, onNewProject }) {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadProjects();
  }, [user]);

  async function loadProjects() {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getProjectDraftsByStudent(user.uid);
      setProjects(data);
    } catch (err) {
      console.error('Projeler yüklenirken hata oluştu:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(projId, e) {
    e.stopPropagation();
    if (confirm('Bu projeyi kalıcı olarak silmek istediğinize emin misiniz?')) {
      await deleteProjectAssistantDraft(projId);
      loadProjects();
      if (selectedProject?.id === projId) setSelectedProject(null);
    }
  }

  // Resmi TEKNOFEST / TÜBİTAK Raporu PDF Olarak İndirme / Yazdırma
  function downloadPDF(proj) {
    const printWindow = window.open('', '_blank');
    const updateDate = proj.updatedAt?.toDate 
      ? new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }).format(proj.updatedAt.toDate()) 
      : new Date().toLocaleDateString('tr-TR');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>${proj.title || 'TEKNOFEST_Proje_Raporu'}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .header-banner {
            border-bottom: 3px solid #dc2626;
            padding-bottom: 12px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .comp-tag {
            background: #fee2e2;
            color: #991b1b;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-block;
          }
          .title {
            font-size: 24px;
            font-weight: 900;
            color: #1e1b4b;
            margin: 12px 0 6px 0;
            line-height: 1.25;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 13px;
            background: #f8fafc;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .meta-table td {
            padding: 8px 14px;
            border-bottom: 1px solid #e2e8f0;
          }
          .meta-table td.label {
            font-weight: 700;
            color: #475569;
            width: 25%;
            background: #f1f5f9;
          }
          .section {
            margin-bottom: 22px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 800;
            color: #1e293b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-left: 4px solid #4f46e5;
            padding-left: 8px;
            margin-bottom: 8px;
            background: #f8fafc;
            padding-top: 4px;
            padding-bottom: 4px;
          }
          .section-content {
            font-size: 13px;
            color: #334155;
            white-space: pre-wrap;
            line-height: 1.65;
            text-align: justify;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 11px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <div>
            <div class="comp-tag">${(proj.competition || 'TEKNOFEST').toUpperCase()} PROJE RAPORU</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Ön Değerlendirme & Proje Detay Dosyası</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748b;">
            <strong>Tarih:</strong> ${updateDate}
          </div>
        </div>

        <h1 class="title">${proj.title || 'Başlıksız Proje'}</h1>

        <table class="meta-table">
          <tr>
            <td class="label">Yarışma Alanı / Kategori:</td>
            <td><strong>${proj.category || 'Belirtilmedi'}</strong></td>
            <td class="label">Hedef Seviye:</td>
            <td>${proj.targetAudience || 'Ortaokul / Lise'}</td>
          </tr>
          <tr>
            <td class="label">Öğrenci / Ekip:</td>
            <td><strong>${proj.userFullName || profile?.fullName || 'Öğrenci'}</strong></td>
            <td class="label">Okul / Kurum:</td>
            <td>${proj.schoolCode || profile?.schoolCode || 'ÖHEP Bilişim'}</td>
          </tr>
        </table>

        ${proj.problemStatement ? `
          <div class="section">
            <div class="section-title">1. Problem Tanımı ve Gerekçe</div>
            <div class="section-content">${proj.problemStatement}</div>
          </div>
        ` : ''}

        ${proj.solutionIdea ? `
          <div class="section">
            <div class="section-title">2. Çözüm Önerisi ve Yöntem</div>
            <div class="section-content">${proj.solutionIdea}</div>
          </div>
        ` : ''}

        ${proj.innovativeAspect ? `
          <div class="section">
            <div class="section-title">3. Yenilikçi Yön ve Özgün Değer</div>
            <div class="section-content">${proj.innovativeAspect}</div>
          </div>
        ` : ''}

        ${proj.systemArchitecture ? `
          <div class="section">
            <div class="section-title">4. Teknik Mimari, Donanım ve Yazılım</div>
            <div class="section-content">${proj.systemArchitecture}</div>
          </div>
        ` : ''}

        ${proj.reportDraft ? `
          <div class="section">
            <div class="section-title">5. Resmi Rapor Özeti ve Rapor Metni</div>
            <div class="section-content">${proj.reportDraft}</div>
          </div>
        ` : ''}

        ${proj.juryFeedback ? `
          <div class="section">
            <div class="section-title">6. Sanal Jüri Değerlendirmesi & Puan Analizi</div>
            <div class="section-content">${proj.juryFeedback}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>ÖHEP AI Studio • TEKNOFEST & TÜBİTAK Proje Platformu</div>
          <div>Sayfa Sonu • Bu belge yapay zeka proje asistanı ile hazırlanmıştır.</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'teknofest') return p.competition === 'teknofest';
    if (filter === 'tubitak') return p.competition && p.competition.includes('tubitak');
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Üst Karşılama Başlığı */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-rose-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-bold mb-3 border border-white/10">
              <span>🚀</span> TEKNOFEST & TÜBİTAK Proje Portfolyom
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Projelerim & Raporlarım
            </h1>
            <p className="text-sm text-indigo-100/90 mt-2 leading-relaxed">
              Yapay zeka asistanı ile adım adım geliştirdiğin tüm projeler burada güvende. Dilediğin zaman düzenleyebilir veya jüriye sunmak için tek tıkla <strong>resmi PDF</strong> olarak indirebilirsin.
            </p>
          </div>

          <button
            onClick={onNewProject}
            className="px-6 py-3.5 rounded-2xl bg-white text-indigo-950 font-black text-sm shadow-xl hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <span>✨</span> Yeni Proje Başlat
          </button>
        </div>
      </div>

      {/* İstatistik ve Filtre Çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tümü ({projects.length})
          </button>
          <button
            onClick={() => setFilter('teknofest')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'teknofest'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🚀 TEKNOFEST ({projects.filter(p => p.competition === 'teknofest').length})
          </button>
          <button
            onClick={() => setFilter('tubitak')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'tubitak'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🔬 TÜBİTAK ({projects.filter(p => p.competition && p.competition.includes('tubitak')).length})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Toplam <strong>{projects.length}</strong> proje kaydı
        </div>
      </div>

      {/* Projeler Listesi */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="inline-block animate-spin text-3xl mb-3">🌀</div>
          <p className="text-sm font-bold text-slate-600">Projeleriniz yükleniyor...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 text-3xl flex items-center justify-center mx-auto shadow-inner">
            📁
          </div>
          <h3 className="text-lg font-bold text-slate-800">Henüz Kaydedilmiş Projeniz Yok</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            TEKNOFEST Asistanı ile fikrinizi problem tanımından jüri simülasyonuna kadar oluşturabilir ve buraya kaydedebilirsiniz.
          </p>
          <button
            onClick={onNewProject}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
          >
            🚀 Hemen İlk Projemi Başlat
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((proj) => {
            const stepNum = proj.currentStep || 1;
            const progressPercent = Math.round((stepNum / 6) * 100);
            const dateStr = proj.updatedAt?.toDate
              ? new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }).format(proj.updatedAt.toDate())
              : 'Bugün';

            return (
              <div
                key={proj.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Kart Üst Başlık & Rozetler */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      proj.competition === 'teknofest' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {proj.competition === 'teknofest' ? '🚀 TEKNOFEST' : '🔬 TÜBİTAK'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {dateStr}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {proj.title || 'Başlıksız Proje Taslağı'}
                  </h3>

                  <p className="text-xs text-indigo-600/90 font-semibold mt-1">
                    {proj.category || 'Genel Kategori'}
                  </p>

                  {/* Problem veya Çözüm Özeti */}
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {proj.problemStatement || proj.solutionIdea || 'Henüz detaylı metin girilmedi.'}
                  </p>

                  {/* İlerleme Çubuğu */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 mb-1.5">
                      <span>Aşama: Adım {stepNum} / 6</span>
                      <span className="text-indigo-600">%{progressPercent}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Alt Aksiyon Butonları */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadPDF(proj)}
                      title="Resmi TEKNOFEST Raporunu PDF Olarak İndir"
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>🖨️</span> PDF İndir
                    </button>

                    <button
                      onClick={() => onOpenProject && onOpenProject(proj)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>✏️</span> Düzenle
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleDelete(proj.id, e)}
                    title="Projeyi Sil"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
