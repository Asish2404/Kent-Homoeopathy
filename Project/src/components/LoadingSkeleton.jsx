import React from "react";

// Reusable skeleton components for loading states

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 rounded w-1/2" />
            <div className="flex gap-2 mt-2">
              <div className="h-5 bg-neutral-200 rounded-full w-16" />
              <div className="h-5 bg-neutral-200 rounded-full w-20" />
            </div>
        </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="flex gap-2 items-center mb-8">
        <div className="h-4 bg-neutral-200 rounded w-16" />
        <div className="h-4 bg-neutral-200 rounded w-4" />
        <div className="h-4 bg-neutral-200 rounded w-20" />
        <div className="h-4 bg-neutral-200 rounded w-4" />
        <div className="h-4 bg-neutral-200 rounded w-32" />
      </div>
      <div className="h-24 bg-neutral-200 rounded-2xl mb-8" />
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div className="aspect-square bg-neutral-200 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
          <div className="h-10 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-1/2" />
          <div className="flex gap-2">{Array(5).fill().map((_, i) => <div key={i} className="h-5 w-5 bg-neutral-200 rounded" />)}</div>
          <div className="h-12 bg-neutral-200 rounded w-1/3" />
          <div className="h-4 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
          <div className="flex gap-2 mt-4">
            <div className="h-12 bg-neutral-200 rounded-xl flex-1" />
            <div className="h-12 bg-neutral-200 rounded-xl flex-1" />
          </div>
      </div>
  );
}

export function DoctorCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-72 bg-neutral-200 sm:h-80" />
      <div className="p-6 space-y-3">
        <div className="h-6 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        <div className="h-4 bg-neutral-200 rounded w-full" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-neutral-200 rounded-2xl" />
          <div className="h-16 bg-neutral-200 rounded-2xl" />
        </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr className="animate-pulse border-t border-neutral-200">
      {Array(cols).fill().map((_, i) => (
        <td key={i} className="py-4 px-2">
          <div className="h-4 bg-neutral-200 rounded" />
        </td>
      ))}
    </tr>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-neutral-200" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-neutral-200 rounded w-16" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
            <div className="h-3 bg-neutral-200 rounded w-1/3" />
          </div>
        <div className="flex gap-4">
          <div className="space-y-2">
            <div className="h-3 bg-neutral-200 rounded w-12" />
            <div className="h-6 bg-neutral-200 rounded-full w-24" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-neutral-200 rounded w-12" />
            <div className="h-4 bg-neutral-200 rounded w-16" />
          </div>
      </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-200" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-neutral-200 rounded w-16" />
          <div className="h-6 bg-neutral-200 rounded w-20" />
        </div>
    </div>
  );
}

export function DashboardChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 animate-pulse">
      <div className="h-5 bg-neutral-200 rounded w-32 mb-4" />
      <div className="h-64 bg-neutral-200 rounded-xl" />
    </div>
  );
}

export function MedicalReportSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-neutral-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-1/2" />
          <div className="h-3 bg-neutral-200 rounded w-1/3" />
          <div className="h-3 bg-neutral-200 rounded w-1/4" />
        </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-72">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="h-28 bg-neutral-200" />
              <div className="px-6 pb-6">
                <div className="w-24 h-24 rounded-3xl bg-neutral-200 -mt-12 border-4 border-white" />
                <div className="h-5 bg-neutral-200 rounded w-24 mt-4" />
                <div className="h-4 bg-neutral-200 rounded w-32 mt-2" />
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-neutral-200 rounded-full w-20" />
                  <div className="h-6 bg-neutral-200 rounded-full w-24" />
                </div>
                <div className="h-12 bg-neutral-200 rounded-2xl mt-5" />
              </div>
          </aside>
          <main className="flex-1 space-y-4">
            <div className="h-32 bg-neutral-200 rounded-3xl" />
            <div className="h-32 bg-neutral-200 rounded-3xl" />
          </main>
        </div>
    </div>
  );
}

export function SearchSuggestionSkeleton() {
  return (
    <div className="px-4 py-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-neutral-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-neutral-200 rounded w-3/4" />
          <div className="h-2.5 bg-neutral-200 rounded w-1/2" />
        </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = "product-card", count = 1 }) {
  const skeletons = {
    "product-card": ProductCardSkeleton,
    "product-detail": ProductDetailSkeleton,
    "doctor-card": DoctorCardSkeleton,
    "order-card": OrderCardSkeleton,
    "stats-card": StatsCardSkeleton,
    "dashboard-chart": DashboardChartSkeleton,
    profile: ProfileSkeleton,
    "medical-report": MedicalReportSkeleton,
    "search-suggestion": SearchSuggestionSkeleton,
  };

  const SkeletonComponent = skeletons[type] || ProductCardSkeleton;

  return (
    <>
      {Array(count).fill().map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </>
  );
}
