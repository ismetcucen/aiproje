import { doc, collection, addDoc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, serverTimestamp, Timestamp, writeBatch, limit } from 'firebase/firestore'
import { db } from './config'
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
    orderBy('createdAt', 'desc')
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

export async function createSubmission({ userId, assignmentId, content, contentType, aiUsed, aiNotes, schoolCode }) {
  const ref = await addDoc(collection(db, 'submissions'), {
    userId, assignmentId, content, contentType,
    aiUsed:    aiUsed   || false,
    aiNotes:   aiNotes  || null,
    schoolCode,
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

export async function upsertFeedback({ submissionId, teacherId, comment, score }) {
  await updateDoc(doc(db, 'submissions', submissionId), { score, feedback: comment, feedbackBy: teacherId, feedbackAt: serverTimestamp() })
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
  if (!snap.empty) return // Zaten yüklenmiş
  
  const list = generateCurriculumList()
  const batch = writeBatch(db)
  
  list.forEach(c => {
    const docRef = doc(db, 'curriculum', `grade_${c.gradeNumber}_week_${c.week}`)
    batch.set(docRef, c)
  })
  
  await batch.commit()
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
  const q = query(
    collection(db, 'classes'),
    where('schoolCode', '==', schoolCode),
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

