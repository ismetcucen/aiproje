const fs = require('fs');

let content = fs.readFileSync('src/components/admin/UserManager.jsx', 'utf8');

// Add deleteUser to imports
if (!content.includes('deleteUser')) {
  content = content.replace(
    "import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore'",
    "import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore'\nimport { deleteUser } from '../../firebase/schema'"
  );
}

// Add handleDeleteUser function
const oldToggleActive = `async function toggleActive(userId, current) {`;
const newHandleDeleteUser = `
  async function handleDeleteUser(userId) {
    if (!window.confirm("Bu kullanıcıyı sistemden TAMAMEN silmek istediğinize emin misiniz? (Bu işlem geri alınamaz!)")) return;
    setUpdating(userId);
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert('Kullanıcı başarıyla silindi.');
    } catch(err) {
      console.error(err);
      alert('Silme işlemi başarısız: ' + err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function toggleActive(userId, current) {`;
content = content.replace(oldToggleActive, newHandleDeleteUser);

// Add the Delete button to the UI
const oldButtons = `<button
                  onClick={() => toggleActive(user.id, user.isActive)}
                  disabled={updating === user.id}
                  className={\`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors \${
                    user.isActive
                      ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-red-700 hover:text-red-400'
                      : 'bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/50'
                  }\`}
                >
                  {updating === user.id ? '...' : user.isActive ? 'Deaktif Et' : 'Aktif Et'}
                </button>`;

const newButtons = `<button
                  onClick={() => toggleActive(user.id, user.isActive)}
                  disabled={updating === user.id}
                  className={\`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors \${
                    user.isActive
                      ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-yellow-700 hover:text-yellow-400'
                      : 'bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/50'
                  }\`}
                >
                  {updating === user.id ? '...' : user.isActive ? 'Deaktif Et' : 'Aktif Et'}
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={updating === user.id}
                  title="Sistemden Tamamen Sil"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900/30 border border-red-800/50 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                >
                  Sil 🗑️
                </button>`;

content = content.replace(oldButtons, newButtons);

// Make UserManager look modern too, let's bump the fonts.
const oldReturnStart = "return (\n    <div className=\"max-w-5xl\">";
const newReturnStart = `return (
    <div className="max-w-7xl mx-auto pb-10">`;
content = content.replace(oldReturnStart, newReturnStart);

const oldTitle = `<h2 className="text-white text-xl font-semibold">Kullanicilar</h2>`;
const newTitle = `<h2 className="text-white text-3xl font-bold tracking-tight mb-1">Kullanıcı Yönetimi</h2>`;
content = content.replace(oldTitle, newTitle);

fs.writeFileSync('src/components/admin/UserManager.jsx', content, 'utf8');
