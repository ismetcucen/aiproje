const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AddStudentModal.jsx', 'utf8');

const functionStart = "async function handleSubmit(e) {";
const functionEnd = "return (\n    <div className=\"fixed inset-0";

const newFunction = `async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fullName.trim()) return setError('Ad soyad gerekli.')
    
    let targetEmail = ''
    let targetPassword = ''
    
    if (mode === 'visual') {
      if (!form.gradeNumber) return setError('Sınıf seviyesi gerekli.')
      targetEmail = \`std_\${form.gradeNumber}_\${normalizeStr(form.fullName)}@aistudio.com\`
      targetPassword = \`vp_\${form.visualId}_2026!\`
    } else {
      if (!form.email.trim()) return setError('Email gerekli.')
      if (!form.password || form.password.length < 6) return setError('Şifre en az 6 karakter olmalı.')
      targetEmail = form.email.trim()
      targetPassword = form.password
    }

    setError(''); setSaving(true)
    
    try {
      const secAuth = getSecondaryAuth();
      let cred;
      
      try {
        cred = await createUserWithEmailAndPassword(secAuth, targetEmail, targetPassword);
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          try {
            // Hesap yarım kalmış, giriş yapıp kurtarmayı deneyelim
            cred = await signInWithEmailAndPassword(secAuth, targetEmail, targetPassword);
          } catch (loginErr) {
            throw new Error('HESAP_VAR_AMA_SIFRE_YANLIS: Bu isimde bir öğrenci var ancak ona atanan görsel bu değildi! Öğrenciyi önceki seçilen görseliyle eklemeyi deneyin. (' + loginErr.message + ')');
          }
        } else {
          throw new Error('KAYIT_HATASI: ' + authErr.message);
        }
      }
      
      try {
        const secDb = getFirestore(secAuth.app);
        await updateProfile(cred.user, { displayName: form.fullName.trim() });
        await setDoc(doc(secDb, 'users', cred.user.uid), {
          fullName:    form.fullName.trim(),
          email:       targetEmail,
          role:        ROLES.STUDENT,
          classLevel:  classLevelFromGrade(form.gradeNumber),
          gradeNumber: Number(form.gradeNumber),
          schoolCode,
          visualId:    mode === 'visual' ? form.visualId : null,
          files:       [],
          createdAt:   serverTimestamp(),
          isActive:    true,
        });
      } catch (firestoreErr) {
        throw new Error('VERITABANI_KAYIT_HATASI: ' + firestoreErr.message);
      }
      
      try {
        if (classInfo) {
          await addStudentToClass(classInfo.id, cred.user.uid);
        }
      } catch (classErr) {
        throw new Error('SINIFA_EKLEME_HATASI: ' + classErr.message);
      }
      
      await signOut(secAuth);
      onSuccess();
    } catch(err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  `;

const startIdx = content.indexOf(functionStart);
const endIdx = content.indexOf(functionEnd);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newFunction + content.substring(endIdx);
  fs.writeFileSync('src/components/admin/AddStudentModal.jsx', content, 'utf8');
  console.log('handleSubmit rewritten entirely');
} else {
  console.log('Could not find function bounds');
}
