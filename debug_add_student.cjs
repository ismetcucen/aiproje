const fs = require('fs');

let content = fs.readFileSync('src/components/admin/AddStudentModal.jsx', 'utf8');

// Replace the entire try-catch block in handleSubmit
const oldTryBlock = `try {
      const secAuth = getSecondaryAuth()
      let cred;
      try {
        cred = await createUserWithEmailAndPassword(secAuth, targetEmail, targetPassword)
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          try {
            cred = await signInWithEmailAndPassword(secAuth, targetEmail, targetPassword)
          } catch (loginErr) {
            throw authErr; // throw original if we can't login
          }
        } else {
          throw authErr;
        }
      }
      const secDb = getFirestore(secAuth.app);
      await updateProfile(cred.user, { displayName: form.fullName.trim() })
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
      })
      if (classInfo) {
        await addStudentToClass(classInfo.id, cred.user.uid)
      }
      await signOut(secAuth)
      onSuccess()
    } catch(err) {
      if (err.code === 'auth/email-already-in-use') setError(mode === 'visual' ? 'Bu isimde ve sınıfta bir öğrenci zaten var.' : 'Bu email zaten kayıtlı.')
      else setError('Öğrenci eklenemedi: ' + err.message)
    }`;

const newTryBlock = `try {
      const secAuth = getSecondaryAuth()
      let cred;
      try {
        cred = await createUserWithEmailAndPassword(secAuth, targetEmail, targetPassword)
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          try {
            cred = await signInWithEmailAndPassword(secAuth, targetEmail, targetPassword)
          } catch (loginErr) {
            throw new Error('HESAP_VAR_AMA_SIFRE_YANLIS: Bu isimde bir öğrenci var ama ona atanan görsel bu değildi! Öğrenciyi önceki görseliyle eklemeyi deneyin. Orijinal Hata: ' + loginErr.message);
          }
        } else {
          throw new Error('CREATE_AUTH_ERROR: ' + authErr.message);
        }
      }
      
      try {
        const secDb = getFirestore(secAuth.app);
        await updateProfile(cred.user, { displayName: form.fullName.trim() })
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
        })
      } catch (firestoreErr) {
        throw new Error('FIRESTORE_KAYIT_HATASI: ' + firestoreErr.message);
      }
      
      try {
        if (classInfo) {
          await addStudentToClass(classInfo.id, cred.user.uid)
        }
      } catch (classErr) {
        throw new Error('SINIFA_EKLEME_HATASI: ' + classErr.message);
      }
      
      await signOut(secAuth)
      onSuccess()
    } catch(err) {
      setError(err.message)
    }`;

content = content.replace(oldTryBlock, newTryBlock);
fs.writeFileSync('src/components/admin/AddStudentModal.jsx', content, 'utf8');
console.log('Detailed error logging added');
