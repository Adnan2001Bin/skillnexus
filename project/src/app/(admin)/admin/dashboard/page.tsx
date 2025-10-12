export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
        <p className="mt-1 text-sm text-slate-600">
          Quick stats for your marketplace.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
        <p className="mt-1 text-sm text-slate-600">
          Latest signups, orders, and updates.
        </p>
      </div>
    </div>
  );
}