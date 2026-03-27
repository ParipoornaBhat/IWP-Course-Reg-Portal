import { Link } from "react-router-dom";
import { BookOpen, ShieldCheck, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <BookOpen className="w-6 h-6 text-primary-500" />,
    title: "Browse Courses",
    desc: "Explore all available courses with real-time seat availability.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    title: "Clash Detection",
    desc: "Automatically detects schedule conflicts before finalizing registration.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-violet-400" />,
    title: "Seat Indicators",
    desc: "Live seat counters prevent over-enrollment across all courses.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center max-w-2xl mt-24 mb-16">
        <span className="inline-block mb-4 badge-green">Smart Registration Active</span>
        <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
          Smart Course{" "}
          <span className="text-primary-500">Registration</span> Portal
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          Register for courses with automatic schedule clash detection and
          real-time seat availability — all in one seamless flow.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/courses" className="btn-primary">View Courses</Link>
          <Link to="/register" className="btn-secondary">Register Now</Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full mb-16">
        {features.map((f) => (
          <div key={f.title} className="card hover:border-slate-600 transition-colors duration-200">
            <div className="mb-3">{f.icon}</div>
            <h3 className="font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
