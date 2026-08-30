import { doc, collection, addDoc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, serverTimestamp, Timestamp, writeBatch, limit, deleteDoc, onSnapshot, increment } from 'firebase/firestore'
import { db, storage } from './config'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { generateCurriculumList } from '../data/defaultCurriculum'

export const ROLES = { STUDENT: 'student', TEACHER: 'teacher', ADMIN: 'admin' }
export const CLASS_LEVELS = { ILKOKUL: 'ilkokul', ORTAOKUL: 'ortaokul', LISE: 'lise' }
export const CONTENT_TYPES = { TEXT: 'text', CODE: 'code', PROJECT: 'project', PRESENTATION: 'presentation' }
export const AI_PURPOSES = { IDEA: 'idea', HELP: 'help', REWRITE: 'rewrite', EXAMPLE: 'example' }

export async function createUserProfile(uid, { fullName, email, role, classLevel, schoolCode, gradeNumber }) {
  await setDoc(doc(db, 'users', uid), {
    fullName, email, role,
    classLevel:  classLevel  || null,
    gradeNumber: gradeNumber || null,
    schoolCode,
    files: files || [],
    createdAt: serverTimestamp(),
    isActive:  true,
  })
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getStudentsBySchool(schoolCode) {
  const q = query(collection(db, 'users'), where('role', '==', ROLES.STUDENT), where('schoolCode', '==', schoolCode), )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createAssignment({ title, description, classLevel, gradeNumbers, contentTypes, dueDate, createdBy, schoolCode, aiAssisted }) {
  const ref = await addDoc(collection(db, 'assignments'), {
    title, description, classLevel,
    gradeNumbers:  gradeNumbers  || [],
    contentTypes:  contentTypes  || Object.values(CONTENT_TYPES),
    dueDate:       dueDate ? Timestamp.fromDate(dueDate) : null,
    createdBy, schoolCode,
    aiAssisted: aiAssisted || false,
    isActive:   true,
    createdAt:  serverTimestamp(),
  })
  return ref.id
}

export async function getAssignmentsForStudent({ classLevel, schoolCode, gradeNumber }) {
  const q = query(
    collection(db, 'assignments'), 
    where('schoolCode', '==', schoolCode), 
    where('isActive', '==', true),
    // Removed orderBy to prevent Firestore index requirements, sorting will happen client-side
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => {
    const levelMatch = a.classLevel === 'all' || a.classLevel === classLevel
    const gradeMatch = !a.gradeNumbers || a.gradeNumbers.length === 0 || a.gradeNumbers.includes(Number(gradeNumber))
    return levelMatch && gradeMatch
  })
}

export async function getAssignmentsByTeacher(teacherUid) {
  const q = query(collection(db, 'assignments'), where('createdBy', '==', teacherUid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createSubmission({ userId, assignmentId, content, contentType, aiUsed, aiNotes, schoolCode, files }) {
  const ref = await addDoc(collection(db, 'submissions'), {
    userId, assignmentId, content, contentType,
    aiUsed:    aiUsed   || false,
    aiNotes:   aiNotes  || null,
    schoolCode,
    files:     files    || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    score: null, feedback: null,
  })
  return ref.id
}

export async function updateSubmission(submissionId, { content, aiUsed, aiNotes }) {
  await updateDoc(doc(db, 'submissions', submissionId), { content, aiUsed: aiUsed || false, aiNotes: aiNotes || null, updatedAt: serverTimestamp() })
}

export async function getSubmissionsByStudent(userId) {
  const q = query(collection(db, 'submissions'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getSubmissionsByAssignment(assignmentId) {
  const q = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getSubmissionsBySchool(schoolCode) {
  const q = query(collection(db, 'submissions'), where('schoolCode', '==', schoolCode), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function upsertFeedback({ submissionId, teacherId, comment, score, isShowcase }) {
  await updateDoc(doc(db, 'submissions', submissionId), { score, feedback: comment, feedbackBy: teacherId, feedbackAt: serverTimestamp(), isShowcase: isShowcase || false })
  await addDoc(collection(db, 'feedbacks'), { submissionId, teacherId, comment, score, createdAt: serverTimestamp() })
}

export async function logAiInteraction({ userId, assignmentId, inputText, outputText, purpose }) {
  await addDoc(collection(db, 'ai_logs'), { userId, assignmentId, inputText, outputText, purpose, createdAt: serverTimestamp() })
}

export async function buildPortfolio(userId) {
  const submissions = await getSubmissionsByStudent(userId)
  if (submissions.length === 0) return []
  const assignmentIds = [...new Set(submissions.map(s => s.assignmentId))]
  const assignmentMap = {}
  await Promise.all(assignmentIds.map(async (aid) => {
    const snap = await getDoc(doc(db, 'assignments', aid))
    if (snap.exists()) assignmentMap[aid] = { id: snap.id, ...snap.data() }
  }))
  return submissions.map(sub => ({ ...sub, assignment: assignmentMap[sub.assignmentId] || null }))
}

export async function seedCurriculum() {
  const q = query(collection(db, 'curriculum'), limit(1))
  const snap = await getDocs(q)
  
  // Sadece sürüm kontrolü yap
  const versionRef = doc(db, 'curriculum_metadata', 'version_v2');
  const versionSnap = await getDoc(versionRef);
  
  if (versionSnap.exists()) return; // Zaten v2 yüklenmiş
  
  const list = generateCurriculumList()
  const batch = writeBatch(db)
  
  list.forEach(c => {
    const docRef = doc(db, 'curriculum', `grade_${c.gradeNumber}_week_${c.week}`)
    batch.set(docRef, c)
  })
  
  await batch.commit()
  await setDoc(versionRef, { installed: true });
}

export async function getCurriculum(gradeNumber) {
  const q = query(
    collection(db, 'curriculum'), 
    where('gradeNumber', '==', Number(gradeNumber))
  )
  const snap = await getDocs(q)
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return list.sort((a, b) => (Number(a.week) || 0) - (Number(b.week) || 0))
}

export async function updateCurriculumWeek(gradeNumber, weekNumber, data) {
  const docRef = doc(db, 'curriculum', `grade_${gradeNumber}_week_${weekNumber}`)
  await updateDoc(docRef, {
    title: data.title,
    description: data.description,
    contentType: data.contentType,
    updatedAt: serverTimestamp()
  })
}

export async function assignCurriculumWeek({ gradeNumber, week, schoolCode, createdBy }) {
  const docRef = doc(db, 'curriculum', `grade_${gradeNumber}_week_${week}`)
  const snap = await getDoc(docRef)
  if (!snap.exists()) throw new Error('Müfredat haftası bulunamadı.')
  const curr = snap.data()
  
  let classLevel = 'ortaokul'
  if (gradeNumber <= 4) classLevel = 'ilkokul'
  else if (gradeNumber >= 9) classLevel = 'lise'
  
  const assignmentId = await createAssignment({
    title: `[Sınıf ${gradeNumber} · Hafta ${week}] ${curr.title}`,
    description: curr.description,
    classLevel,
    gradeNumbers: [Number(gradeNumber)],
    contentTypes: [curr.contentType || 'text'],
    dueDate: null,
    createdBy,
    schoolCode,
    aiAssisted: true
  })
  
  return assignmentId
}

// ─── SINIFLAR ────────────────────────────────

export async function createClass({ grade, section, schoolCode, teacherId }) {
  const ref = await addDoc(collection(db, 'classes'), {
    grade,       // "3", "4" ... "10"
    section,     // "A", "B", "C"
    name:        `${grade}/${section}`,
    schoolCode,
    teacherId:   teacherId || null,
    createdAt:   serverTimestamp(),
    isActive:    true,
  })
  return ref.id
}

export async function getClassesBySchool(schoolCode) {
  const code = schoolCode || 'OHEP'
  const q = query(
    collection(db, 'classes'),
    where('schoolCode', '==', code),
    where('isActive', '==', true)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function addStudentToClass(classId, userId) {
  await setDoc(doc(db, 'class_students', `${classId}_${userId}`), {
    classId,
    userId,
    joinedAt: serverTimestamp(),
  })
}

export async function getStudentsByClass(classId) {
  const q = query(
    collection(db, 'class_students'),
    where('classId', '==', classId)
  )
  const snap = await getDocs(q)
  const studentIds = snap.docs.map(d => d.data().userId)
  if (studentIds.length === 0) return []
  const students = await Promise.all(
    studentIds.map(async (uid) => {
      const s = await getDoc(doc(db, 'users', uid))
      return s.exists() ? { id: s.id, ...s.data() } : null
    })
  )
  return students.filter(Boolean)
}

export async function removeStudentFromClass(classId, userId) {
  await updateDoc(doc(db, 'class_students', `${classId}_${userId}`), {
    removedAt: serverTimestamp(),
  })
}

// ─── HAFTALIK MÜFREDAT ATAMA ─────────────────

export async function assignWeekToClass({ classId, schoolCode, grade, week, title, description, activity, assignedBy }) {
  const ref = await addDoc(collection(db, 'assignments'), {
    title,
    description,
    activity,
    classLevel:   'all',
    gradeNumbers: [Number(grade)],
    contentTypes: ['text', 'project'],
    dueDate:      null,
    createdBy:    assignedBy,
    schoolCode,
    classId,
    week:         Number(week),
    grade,
    aiAssisted:   false,
    isActive:     true,
    isCurriculum: true,
    createdAt:    serverTimestamp(),
  })
  return ref.id
}

export async function getAssignmentsByClass(classId) {
  const q = query(
    collection(db, 'assignments'),
    where('classId', '==', classId),
    where('isActive', '==', true)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.week || 0) - (b.week || 0))
}



// ─── STORAGE ───────────────────────────────────────────────────

export async function uploadFile(userId, file, onProgress) {
  if (!file) return null;
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `submissions/${userId}/${fileName}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ url: downloadURL, name: file.name, type: file.type });
      }
    );
  });
}


export async function getPublicPortfolio(userId) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  const userData = userDoc.data();
  // if (!userData.publicPortfolio) return null; // Make everything public for now

  const submissions = await getSubmissionsByStudent(userId);
  return {
    student: { fullName: userData.fullName, gradeNumber: userData.gradeNumber, badges: userData.badges || [] },
    submissions: submissions.filter(s => s.score !== null) // only graded
  };
}


// ─── YOKLAMA (ATTENDANCE) ──────────────────────────────────────

export async function logAttendance(userId) {
  if (!userId) return;
  const today = new Date();
  // YYYY-MM-DD
  const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    loginDates: arrayUnion(dateStr)
  }).catch(() => {
    // maybe field doesn't exist yet, arrayUnion still works if doc exists.
  });
}

export async function deleteClass(classId) {
  await deleteDoc(doc(db, 'classes', classId))
}

export async function updateClass(classId, data) {
  await updateDoc(doc(db, 'classes', classId), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteUser(userId) {
  // Hard delete a user
  await deleteDoc(doc(db, 'users', userId))
}

export async function updateUser(userId, data) {
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function forceRemoveStudentFromClass(classId, userId) {
  // Hard delete the association instead of soft delete
  await deleteDoc(doc(db, 'class_students', `${classId}_${userId}`))
}

// --- NOTIFICATIONS ---
export async function createNotification(userId, { title, message, type, link }) {
  await addDoc(collection(db, 'notifications'), {
    userId,
    title,
    message,
    type: type || 'general',
    link: link || null,
    isRead: false,
    createdAt: serverTimestamp()
  })
}

export async function markNotificationAsRead(notifId) {
  await updateDoc(doc(db, 'notifications', notifId), { isRead: true })
}

export async function getUserNotifications(userId) {
  const q = query(
    collection(db, 'notifications'), 
    where('userId', '==', userId), 
    orderBy('createdAt', 'desc'), 
    limit(20)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function listenUserNotifications(userId, callback) {
  
  const q = query(
    collection(db, 'notifications'), 
    where('userId', '==', userId), 
    orderBy('createdAt', 'desc'), 
    limit(20)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

// --- SCHOOL SETTINGS ---
export async function getSchoolSettings(schoolCode) {
  const snap = await getDoc(doc(db, 'school_settings', schoolCode));
  if (snap.exists()) return snap.data();
  return { codingModuleEnabled: true, aiAssistantEnabled: true };
}

export async function updateSchoolSettings(schoolCode, data) {
  await setDoc(doc(db, 'school_settings', schoolCode), data, { merge: true });
}

export async function createTubitakProject(data) {
  return await addDoc(collection(db, 'tubitak_projects'), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function getTubitakProjects() {
  const q = query(collection(db, 'tubitak_projects'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteTubitakProject(id) {
  await deleteDoc(doc(db, 'tubitak_projects', id));
}

export async function updateTubitakProject(id, data) {
  await updateDoc(doc(db, 'tubitak_projects', id), data);
}

export async function createEvent({ userId, title, description, eventDate }) {
  return await addDoc(collection(db, 'events'), {
    userId,
    title,
    description,
    eventDate: new Date(eventDate),
    notified: false,
    createdAt: serverTimestamp()
  });
}

export async function getUserEvents(userId) {
  const q = query(collection(db, 'events'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const events = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return events.sort((a, b) => {
    const dA = a.eventDate?.toDate ? a.eventDate.toDate() : new Date(a.eventDate);
    const dB = b.eventDate?.toDate ? b.eventDate.toDate() : new Date(b.eventDate);
    return dA - dB;
  });
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, 'events', eventId));
}

export async function markEventAsNotified(eventId) {
  await updateDoc(doc(db, 'events', eventId), { notified: true });
}

export async function createAnnouncement({ message, targetRole, createdBy }) {
  return await addDoc(collection(db, 'announcements'), {
    message,
    targetRole, // 'all', 'student', 'teacher'
    createdBy,
    createdAt: serverTimestamp()
  });
}

export async function getLatestAnnouncements(targetRole = 'all') {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(5));
  const snap = await getDocs(q);
  const allAnnouncements = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // If we are explicitly asking for 'admin', return all of them so admin sees everything
  if (targetRole === 'admin') return allAnnouncements;
  
  // Otherwise filter properly
  return allAnnouncements.filter(a => a.targetRole === 'all' || a.targetRole === targetRole);
}

export async function deleteAllAnnouncements() {
  const q = query(collection(db, 'announcements'))
  const snapshot = await getDocs(q)
  const batch = writeBatch(db)
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })
  await batch.commit()
}

export async function deleteAnnouncement(id) {
  await deleteDoc(doc(db, 'announcements', id));
}

export async function awardXP(userId, xpAmount, reason) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const currentXP = snap.data().xp || 0;
    await updateDoc(userRef, { xp: currentXP + xpAmount });
    
    // Create an XP log document for history
    await addDoc(collection(db, 'xp_logs'), {
      userId,
      xpAmount,
      reason,
      createdAt: serverTimestamp()
    });
  }
}

export async function getLeaderboard(schoolCode) {
  const q = query(collection(db, 'users'), where('schoolCode', '==', schoolCode), where('role', '==', 'student'));
  const snap = await getDocs(q);
  const students = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return students.sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10);
}

// ─── Q&A (Soru-Cevap) ──────────────────────────────────────────

export async function askQuestion({ studentId, teacherId, question, studentName }) {
  return await addDoc(collection(db, 'qna'), {
    studentId,
    teacherId,
    question,
    studentName,
    answer: null,
    isAnswered: false,
    createdAt: serverTimestamp()
  });
}

export async function answerQuestion(qnaId, answer, teacherName) {
  const qRef = doc(db, 'qna', qnaId);
  await updateDoc(qRef, {
    answer,
    answeredBy: teacherName,
    isAnswered: true,
    answeredAt: serverTimestamp()
  });
}

export async function getQnaByStudent(studentId) {
  const q = query(collection(db, 'qna'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return items.sort((a, b) => {
    const dA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date();
    const dB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
    return dB - dA; // desc
  });
}

export async function getQnaForTeacher(teacherId) {
  const q = query(collection(db, 'qna'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return items.sort((a, b) => {
    const dA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date();
    const dB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
    return dB - dA; // desc
  });
}

// ─── BADGES ───────────────────────────────────────────────────

export const BADGES = {
  FIRST_STEP: { id: 'first_step', icon: '🥉', title: 'İlk Adım', desc: 'Sisteme ilk görevini başarıyla teslim ettin!' },
  SPEED_DEMON: { id: 'speed_demon', icon: '🚀', title: 'Hız Canavarı', desc: 'Görevini verildiği gün tamamladın!' },
  STAR_STUDENT: { id: 'star_student', icon: '⭐', title: 'Yıldız Öğrenci', desc: '100 XP barajını aştın!' },
  AI_MASTER: { id: 'ai_master', icon: '🧠', title: 'Yapay Zeka Uzmanı', desc: 'Yapay zekayı projelerinde etkili kullandın.' }
};

export async function awardBadge(userId, badgeId) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const currentBadges = snap.data().badges || [];
    if (!currentBadges.includes(badgeId)) {
      await updateDoc(userRef, { badges: arrayUnion(badgeId) });
      return true; // Newly awarded
    }
  }
  return false;
}

// ─── SHOWCASE ─────────────────────────────────────────────────

export async function getShowcaseSubmissions(schoolCode) {
  const q = query(collection(db, 'submissions'), where('schoolCode', '==', schoolCode), where('isShowcase', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ─── LIVE CHAT (Anlık Mesajlaşma) ──────────────────────────────────────────

export async function sendChatMessage({ senderId, receiverId, schoolCode, text, senderName, senderRole }) {
  // To identify the chat uniquely between student and school/teacher
  // We'll store messages globally but query by studentId since it's a 1-to-1 between student and admin
  return await addDoc(collection(db, 'messages'), {
    senderId,
    receiverId, 
    schoolCode, // to allow any teacher in the school to see it
    text,
    senderName,
    senderRole, // 'student' or 'teacher'
    isRead: false,
    createdAt: serverTimestamp()
  });
}

export function listenChatMessages(studentId, callback) {
  const q = query(
    collection(db, 'messages'),
     
    // Wait, let's just query by a chatRoomId: studentId
    where('chatRoomId', '==', studentId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

export async function sendChatMsg({ chatRoomId, senderId, text, senderName, senderRole, schoolCode }) {
  return await addDoc(collection(db, 'messages'), {
    chatRoomId, // The student's UID represents the room
    senderId,
    text,
    senderName,
    senderRole, // 'student' or 'teacher'
    schoolCode, // So teachers can query all active chats in their school
    isRead: false,
    createdAt: serverTimestamp()
  });
}

export function listenAllSchoolChats(schoolCode, callback) {
  // Listen to all messages in the school to build a chat list
  const q = query(
    collection(db, 'messages'),
    where('schoolCode', '==', schoolCode),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

export async function markChatAsRead(chatRoomId, readerRole) {
  // If reader is teacher, mark all where senderRole == student as read
  // We'll do a simple batch update (or just ignore read status for now to save complexity)
}


// ─── LIVE SESSIONS (CANLI SINIF) ────────────────────────────────

export function listenToLiveSession(schoolCode, gradeNumber, callback) {
  if (!schoolCode || !gradeNumber) return () => {};
  const docId = schoolCode + '_' + gradeNumber;
  return onSnapshot(doc(db, 'live_sessions', docId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    else callback(null);
  });
}

export async function setLiveSession(schoolCode, gradeNumber, data) {
  const docId = schoolCode + '_' + gradeNumber;
  await setDoc(doc(db, 'live_sessions', docId), {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function submitLiveAnswer(sessionId, questionId, studentId, studentName, answer) {
  await addDoc(collection(db, 'live_answers'), {
    sessionId,
    questionId,
    studentId,
    studentName,
    answer,
    createdAt: serverTimestamp()
  });
}

export function listenToLiveAnswers(sessionId, questionId, callback) {
  if (!sessionId || !questionId) return () => {};
  const q = query(
    collection(db, 'live_answers'),
    where('sessionId', '==', sessionId),
    where('questionId', '==', questionId)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}


// ─── OHEP DOJO (SINIF YILDIZLARI) ────────────────────────────────

export async function awardDojoPoints(studentId, points, reason) {
  const userRef = doc(db, 'users', studentId);
  await updateDoc(userRef, {
    dojoPoints: increment(points),
    lastDojoAward: {
      id: Date.now().toString(),
      points: points,
      reason: reason,
      timestamp: serverTimestamp()
    }
  });
}


// --- ROBOT ANNOUNCEMENTS ---
export const sendRobotAnnouncement = async (message) => {
  const docRef = doc(db, 'classes', 'GLOBAL_ROBOT_ANNOUNCEMENT')
  await setDoc(docRef, { message, timestamp: Date.now() })
}

export const listenToRobotAnnouncement = (callback) => {
  return onSnapshot(doc(db, 'classes', 'GLOBAL_ROBOT_ANNOUNCEMENT'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data())
    }
  })
}

// --- DIGITAL BOARD ---
export async function getDigitalBoardSettings(schoolCode) {
  if (!schoolCode) schoolCode = 'OHEP'
  const docRef = doc(db, 'school_settings', `digital_board_${schoolCode}`)
  const snap = await getDoc(docRef)
  if (snap.exists()) {
    return snap.data()
  }
  return {
    backgroundImageUrl: '',
    dutyTeachers: { primary: '', middle: '', high: '' },
    examDates: { lgs: '', tyt: '', ayt: '' },
    timetable: [],
    dailyMenu: [],
    quoteOfTheDay: ''
  }
}

export async function updateDigitalBoardSettings(schoolCode, data) {
  if (!schoolCode) schoolCode = 'OHEP'
  const docRef = doc(db, 'school_settings', `digital_board_${schoolCode}`)
  await setDoc(docRef, data, { merge: true })
}
