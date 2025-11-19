
// FILE: app/(public)/page.tsx
import Link from 'next/link';
import { Sparkles, FileText, Bell, CheckCircle2, MapPin, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="logo-pill">SC</div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400">
                  Smart City
                </div>
                <div className="text-sm font-semibold text-slate-100">
                  Pokhara Portal
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-secondary text-xs">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-xs">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/50">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">
                  Serving 33 Wards · 600,000+ Citizens
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight">
                Report City Issues.
                <br />
                Track Progress.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  Live Updates.
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-xl">
                Smart City Pokhara makes it easy to report problems like potholes,
                broken streetlights, waste management issues, and more. Your voice
                matters — submit complaints and track resolution in real-time.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
                >
                  Get Started
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-700 text-slate-200 font-semibold hover:bg-slate-800/50 transition-all"
                >
                  Sign In
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">12,547</div>
                  <div className="text-xs text-slate-500">Resolved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">33</div>
                  <div className="text-xs text-slate-500">Active Wards</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">48h</div>
                  <div className="text-xs text-slate-500">Avg Response</div>
                </div>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950/50 to-slate-950 border border-slate-800/50 backdrop-blur-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative flex items-center justify-center w-full h-full">
                      <MapPin className="w-32 h-32 text-emerald-400" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute top-8 right-8 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Status</div>
                      <div className="text-sm font-semibold text-slate-100">Resolved</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Response Time</div>
                      <div className="text-sm font-semibold text-slate-100">24-48 hours</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Submit, track, and resolve city issues in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="card p-8 text-center space-y-4 hover:border-emerald-800/50 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-800/50 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="text-xl font-semibold text-slate-100">
                  Submit Complaint
                </h3>
                <p className="text-sm text-slate-400">
                  Report issues like potholes, broken lights, garbage collection,
                  or water supply problems with photos and location.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="card p-8 text-center space-y-4 hover:border-emerald-800/50 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-800/50 flex items-center justify-center mx-auto">
                  <Bell className="w-8 h-8 text-blue-400" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="text-xl font-semibold text-slate-100">
                  Track Progress
                </h3>
                <p className="text-sm text-slate-400">
                  Receive real-time notifications as your complaint moves through
                  review, assignment, and resolution stages.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="card p-8 text-center space-y-4 hover:border-emerald-800/50 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-800/50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-amber-400" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="text-xl font-semibold text-slate-100">
                  Get Resolved
                </h3>
                <p className="text-sm text-slate-400">
                  Our ward teams work to resolve your issue. Once complete,
                  you can provide feedback on the service quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="card p-12 text-center bg-gradient-to-br from-emerald-950/30 to-slate-950 border-emerald-800/30">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of citizens making Pokhara cleaner, safer, and better
              for everyone. Register now and submit your first complaint.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
              >
                Create Citizen Account
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="logo-pill">SC</div>
                <div className="text-sm font-semibold text-slate-100">
                  Smart City Pokhara
                </div>
              </div>
              <p className="text-xs text-slate-500">
                पोखरा महानगरपालिका
                <br />
                Pokhara Metropolitan City
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-100 mb-3">Contact</h3>
              <div className="space-y-2 text-xs text-slate-400">
                <div>📞 061-571104, 571105</div>
                <div>📧 info@pokharamun.gov.np</div>
                <div>🔥 Hello Mayor: 1181</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-100 mb-3">Quick Links</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <a href="/login" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Sign In
                  </a>
                </div>
                <div>
                  <a href="/register" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Register
                  </a>
                </div>
                <div>
                  <a href="https://pokharamun.gov.np" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Official Website
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/50 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Pokhara Metropolitan City. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
