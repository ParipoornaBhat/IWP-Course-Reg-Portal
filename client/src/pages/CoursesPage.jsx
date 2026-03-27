import { useEffect, useState } from "react";
import { getCourses } from "../api";
import { Users, Clock } from "lucide-react";

function SeatBadge({ enrolled, total }) {
  const pct = (enrolled / total) * 100;
  if (pct >= 100) return <span className="badge-red">Full</span>;
  if (pct >= 75) return <span className="badge-yellow">Limited</span>;
  return <span className="badge-green">Available</span>;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data))
      .catch(() => setError("Could not load courses. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Available Courses</h1>
        <p className="text-slate-400">Select courses to register. Check seat availability before proceeding.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-slate-400 animate-pulse">
          Loading courses...
        </div>
      )}

      {error && (
        <div className="card border-red-900 text-red-400 text-sm">{error}</div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="card text-slate-400 text-center py-12">
          No courses available yet. Add some via the API.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course._id} className="card hover:border-slate-600 transition-all duration-200 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-500 font-mono mb-1 block">{course.code}</span>
                <h3 className="font-semibold text-white">{course.name}</h3>
              </div>
              <SeatBadge enrolled={course.enrolledSeats} total={course.totalSeats} />
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Users className="w-4 h-4" />
              <span>{course.enrolledSeats} / {course.totalSeats} seats</span>
            </div>

            {/* Seat progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  course.enrolledSeats >= course.totalSeats
                    ? "bg-red-500"
                    : course.enrolledSeats / course.totalSeats >= 0.75
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min((course.enrolledSeats / course.totalSeats) * 100, 100)}%` }}
              />
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-1">
              {course.schedule?.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{s.day} • {s.startTime} – {s.endTime}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500">{course.credits} Credit{course.credits !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
