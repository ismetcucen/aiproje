import { useState } from 'react';
import { getAuth, updatePassword } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

export default function ChangePasswordModal({ onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      return setError('Şifre en az 4 karakter olmalıdır.');
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Oturum bulunamadı.');

      // Update in Firebase Auth
      await updatePassword(user, newPassword);

      // Update in Firestore so Admin can see it
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { simplePass: newPassword });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Güvenlik nedeniyle şifre değiştirmeden önce hesaptan çıkıp tekrar giriş yapmanız gerekmektedir.');
      } else {
        setError('Şifre değiştirilirken bir hata oluştu: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white text-center">
          <h2 className="text-xl font-bold">Şifremi Değiştir</h2>
        </div>
        
        {success ? (
          <div className="p-6 text-center">
            <span className="text-5xl block mb-2">✅</span>
            <p className="text-emerald-600 font-bold mb-4">Şifreniz başarıyla güncellendi!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Yeni Şifreniz</label>
              <input 
                type="text" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Örn: kaplan123" 
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <p className="text-xs text-slate-400 mt-2">* Yeni şifrenizi unutmamaya özen gösterin.</p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                İptal
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? 'Güncelleniyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
