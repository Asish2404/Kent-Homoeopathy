import { useMemo } from "react";
import { CalendarDays, Clock, Stethoscope, UserRound, AlertCircle } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function Appointments({ appointments = [] }) {
  const list = useMemo(() => (Array.isArray(appointments) ? appointments : []), [appointments]);

  if (!list.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No appointments found"
        description="Book a doctor visit to see upcoming and previous appointments here."
      />
    );
  }

  const upcoming = list.filter((a) => a.kind !== "previous");
  const previous = list.filter((a) => a.kind === "previous");

  const renderCard = (a, idx) => {
    const status = a.status || "Scheduled";
    const statusColor =
      status === "Completed"
        ? "bg-emerald-100 text-emerald-700"
        : status === "Cancelled"
          ? "bg-rose-100 text-rose-700"
          : "bg-blue-100 text-blue-700";

    return (
      <div key={`${a.id || idx}`} className="bg-white rounded-3xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border flex items-center justify-center">
              <Stethoscope size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Doctor</p>
              <p className="text-gray-800 font-semibold mt-1">{a.doctor || a.name || "—"}</p>
              <p className="text-gray-500 text-sm mt-1">{a.department || "General"}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 w-full md:w-auto">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Date</p>
              <p className="text-gray-800 font-semibold mt-1">{a.date || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Time</p>
              <p className="text-gray-800 font-semibold mt-1">{a.time || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                {status === "Cancelled" ? <AlertCircle size={14} className="mr-2" /> : <Clock size={14} className="mr-2" />}
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-gray-500 text-sm">
          <UserRound size={16} />
          <span>{a.note || "Appointment details"}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">{upcoming.map(renderCard)}</div>
        </div>
      )}

      {previous.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Previous Appointments</h2>
          <div className="space-y-4">{previous.map(renderCard)}</div>
        </div>
      )}

      {upcoming.length === 0 && previous.length === 0 && <EmptyState />}
    </div>
  );
}

