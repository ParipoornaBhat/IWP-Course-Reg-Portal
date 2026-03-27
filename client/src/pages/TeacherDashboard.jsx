import { useState, useEffect } from "react";
import { createCourse, getCourses, updateCourse, deleteCourse, getCourseStudents, addStudentToCourse, removeStudentFromCourse } from "../api";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, BookOpenCheck, Clock, Users, UserPlus, Trash2, X, Edit3, ChevronDown, ChevronUp, Plus, Loader2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const emptySlot = () => ({ day: "Monday", startTime: "09:00", endTime: "10:00" });

const emptyForm = {
  name: "",
  code: "",
  credits: 3,
  totalSeats: 40,
  schedule: [emptySlot()],
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  // Expanded Course State
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");
  const [mgmtStatus, setMgmtStatus] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await getCourses();
      setCourses(res.data);
    } finally {
      setLoadingCourses(false);
    }
  };

  const openModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setForm({
        name: course.name,
        code: course.code,
        credits: course.credits,
        totalSeats: course.totalSeats,
        schedule: course.schedule || [emptySlot()],
      });
    } else {
      setEditingCourse(null);
      setForm(emptyForm);
    }
    setStatus(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, form);
        setStatus({ type: "success", message: "Course updated successfully!" });
      } else {
        await createCourse(form);
        setStatus({ type: "success", message: "Course created successfully!" });
      }
      fetchCourses();
      setTimeout(closeModal, 1500);
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Operation failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course? All enrollments will be lost.")) return;
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c._id !== id));
      if (expandedCourseId === id) setExpandedCourseId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course.");
    }
  };

  const toggleExpand = async (courseId) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }
    
    setExpandedCourseId(courseId);
    setLoadingStudents(true);
    setMgmtStatus(null);
    setStudents([]);
    try {
      const res = await getCourseStudents(courseId);
      setStudents(res.data);
    } catch {
      setMgmtStatus({ type: "error", message: "Failed to load students." });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentId.trim()) return;
    setSubmitting(true);
    setMgmtStatus(null);
    try {
      const res = await addStudentToCourse(expandedCourseId, newStudentId);
      setStudents(prev => [...prev, res.data.student]);
      setNewStudentId("");
      setMgmtStatus({ type: "success", message: res.data.message });
      setCourses(prev => prev.map(c => c._id === expandedCourseId ? { ...c, enrolledSeats: c.enrolledSeats + 1 } : c));
    } catch (err) {
      setMgmtStatus({ type: "error", message: err.response?.data?.message || "Failed to add student." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async (userId) => {
    if (!window.confirm("Remove this student from the course?")) return;
    try {
      await removeStudentFromCourse(expandedCourseId, userId);
      setStudents(prev => prev.filter(s => s._id !== userId));
      setCourses(prev => prev.map(c => c._id === expandedCourseId ? { ...c, enrolledSeats: c.enrolledSeats - 1 } : c));
    } catch {
      setMgmtStatus({ type: "error", message: "Failed to remove student." });
    }
  };

  const updateSchedule = (i, field, value) => {
    setForm(f => {
      const schedule = [...f.schedule];
      schedule[i] = { ...schedule[i], [field]: value };
      return { ...f, schedule };
    });
  };

  return (
    <main className="max-w-5xl mx-auto px-4 pt-24 pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Teacher Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage courses and student directory</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Course</span>
        </button>
      </div>

      {loadingCourses ? (
        <div className="flex justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-slate-400 text-center py-16 border-dashed border-2 border-slate-800 bg-transparent">
          <BookOpenCheck className="w-12 h-12 mx-auto mb-4 text-slate-700" />
          <p className="text-lg font-medium text-slate-300">No courses available</p>
          <p className="text-sm mt-1">Click the button above to create your first course.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(c => (
            <div key={c._id} className={`card p-0 overflow-hidden transition-all duration-300 ${expandedCourseId === c._id ? 'ring-1 ring-primary-500/50 bg-slate-900/60' : 'hover:bg-slate-800/40'}`}>
              <div 
                className="flex items-center gap-4 p-5 cursor-pointer" 
                onClick={() => toggleExpand(c._id)}
              >
                <div className="bg-primary-900/20 p-2.5 rounded-xl text-primary-500 hidden sm:block">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 uppercase">{c.code}</span>
                    <h3 className="font-bold text-white truncate">{c.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> {c.schedule?.[0]?.day.slice(0,3)} {c.schedule?.[0]?.startTime}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-500" /> {c.enrolledSeats}/{c.totalSeats}</span>
                    <span className="text-primary-400 font-medium">{c.credits} CR</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => openModal(c)}
                    className="p-2 text-slate-400 hover:text-primary-400 hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCourse(c._id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-slate-800 mx-2"></div>
                  <button 
                    className={`p-1.5 rounded-lg transition-colors ${expandedCourseId === c._id ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-white'}`}
                  >
                    {expandedCourseId === c._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {expandedCourseId === c._id && (
                <div className="border-t border-slate-800/60 bg-slate-900/40 p-5 space-y-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                       <Users className="w-4 h-4 text-primary-500" />
                       Enrolled Students
                    </h4>
                    <form onSubmit={handleAddStudent} className="flex gap-2">
                      <input
                        value={newStudentId}
                        onChange={(e) => setNewStudentId(e.target.value.toUpperCase())}
                        placeholder="Enroll Student ID..."
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full sm:w-48"
                      />
                      <button type="submit" disabled={submitting} className="btn-primary px-3 py-1.5 text-xs flex items-center gap-2 whitespace-nowrap">
                        {submitting ? <Loader2 className="w-3 h-3 animate-spin"/> : <UserPlus className="w-3.5 h-3.5" />}
                        Enroll
                      </button>
                    </form>
                  </div>

                  {mgmtStatus && (
                    <div className={`p-2.5 rounded-lg border text-xs ${
                      mgmtStatus.type === "success" ? "bg-emerald-900/10 border-emerald-800/50 text-emerald-400" : "bg-red-900/10 border-red-900/50 text-red-100"
                    }`}>
                      {mgmtStatus.message}
                    </div>
                  )}

                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Student Name</th>
                          <th className="px-4 py-3 font-semibold">Student ID</th>
                          <th className="px-4 py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {loadingStudents ? (
                          <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-500 text-xs animate-pulse">Fetching directory...</td></tr>
                        ) : students.length === 0 ? (
                          <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-500 text-xs italic">No students enrolled.</td></tr>
                        ) : (
                          students.map(s => (
                            <tr key={s._id} className="hover:bg-slate-800/30 transition-colors group">
                              <td className="px-4 py-3">
                                <span className="text-slate-200 text-sm font-medium">{s.name}</span>
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-mono text-[11px] uppercase">
                                {s.studentId || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => handleRemoveStudent(s._id)}
                                  className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Course Modal (Create/Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editingCourse ? <Edit3 className="w-5 h-5 text-primary-500" /> : <PlusCircle className="w-5 h-5 text-primary-500" />}
                <span>{editingCourse ? 'Update Course' : 'Create Course'}</span>
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 pl-1 tracking-widest">Course Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 pl-1 tracking-widest">Course Code</label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white uppercase focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 pl-1 tracking-widest">Credits</label>
                  <input
                    type="number" min={1} max={6}
                    value={form.credits}
                    onChange={(e) => setForm(f => ({ ...f, credits: Number(e.target.value) }))}
                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 pl-1 tracking-widest">Enrollment Seats</label>
                  <input
                    type="number" min={1}
                    value={form.totalSeats}
                    onChange={(e) => setForm(f => ({ ...f, totalSeats: Number(e.target.value) }))}
                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Weekly Schedule</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, schedule: [...f.schedule, emptySlot()] }))} className="text-[10px] text-primary-400 hover:text-primary-300 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Slot
                  </button>
                </div>
                <div className="space-y-3">
                  {form.schedule.map((slot, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 relative group">
                      <select
                        value={slot.day}
                        onChange={(e) => updateSchedule(i, "day", e.target.value)}
                        className="bg-slate-800 border-none rounded-lg px-2 py-2 text-xs text-white focus:ring-1 focus:ring-primary-500"
                      >
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <div className="flex items-center gap-2">
                        <input type="time" value={slot.startTime}
                          onChange={(e) => updateSchedule(i, "startTime", e.target.value)}
                          className="bg-slate-800 border-none rounded-lg px-2 py-2 text-xs text-white focus:ring-1 focus:ring-primary-500"
                        />
                        <span className="text-slate-600">-</span>
                        <input type="time" value={slot.endTime}
                          onChange={(e) => updateSchedule(i, "endTime", e.target.value)}
                          className="bg-slate-800 border-none rounded-lg px-2 py-2 text-xs text-white focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      {form.schedule.length > 1 && (
                        <button type="button" onClick={() => setForm(f => ({ ...f, schedule: f.schedule.filter((_, idx) => idx !== i) }))} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors ml-auto">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {status && (
                <div className={`p-4 rounded-xl border text-sm transition-all duration-300 ${
                  status.type === "success" ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" : "bg-red-950/20 border-red-900 text-red-100"
                }`}>
                  {status.message}
                </div>
              )}
            </form>

            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all text-[10px]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting} 
                className="flex-[2] btn-primary py-3 text-[10px] font-bold uppercase tracking-widest"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  editingCourse ? 'Save Changes' : 'Create Course'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
