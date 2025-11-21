// components/ComplaintFiltersBar.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Filter, Search } from "lucide-react";

interface FiltersBarProps {
  categories: Array<{ id: string; category_name: string }>;
  wards: Array<{ id: string; ward_number: number; ward_name: string }>;
  language: "en" | "np";
}

export function ComplaintFiltersBar({
  categories,
  wards,
  language,
}: FiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statuses, setStatuses] = useState<string[]>(
    (searchParams.get("statuses") || "").split(",").filter(Boolean)
  );
  const [priorities, setPriorities] = useState<string[]>(
    (searchParams.get("priorities") || "").split(",").filter(Boolean)
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");

  // Derived state for chips
  const isDirty = !!(
    search ||
    statuses.length ||
    priorities.length ||
    dateFrom ||
    dateTo
  );

  const activeCount = useMemo(
    () =>
      [
        search ? 1 : 0,
        statuses.length ? 1 : 0,
        priorities.length ? 1 : 0,
        dateFrom ? 1 : 0,
        dateTo ? 1 : 0,
      ].reduce((a, b) => a + b, 0),
    [search, statuses.length, priorities.length, dateFrom, dateTo]
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search.trim());
    if (statuses.length) params.set("statuses", statuses.join(","));
    if (priorities.length) params.set("priorities", priorities.join(","));
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "?");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statuses, priorities, dateFrom, dateTo]);

  const reset = () => {
    setSearch("");
    setStatuses([]);
    setPriorities([]);
    setDateFrom("");
    setDateTo("");
  };

  return (
    <section className="card space-y-4 p-5 md:p-6 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-sm shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-400">
            <Filter className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              {language === "en"
                ? "Filter complaints"
                : "गुनासो फिल्टर गर्नुहोस्"}
            </h3>
            <p className="text-xs text-slate-400">
              {language === "en"
                ? "Narrow down your list by status, priority and date."
                : "स्थिति, प्राथमिकता र मिति अनुसार गुनासोहरू छान्नुहोस्।"}
            </p>
          </div>
        </div>

        {isDirty && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
          >
            <X className="h-3 w-3" />
            {language === "en" ? "Clear all" : "सबै हटाउनुहोस्"}
            <span className="ml-1 inline-flex h-4 min-w-[1.5rem] items-center justify-center rounded-full bg-slate-900/80 text-[10px]">
              {activeCount}
            </span>
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-medium text-slate-200 mb-1.5 block">
          {language === "en" ? "Search" : "खोज"}
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === "en"
                ? "Tracking ID or title (e.g. PKR-2025-001)..."
                : "ट्र्याकिङ ID वा शीर्षक..."
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 pl-9 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500/80 transition"
          />
        </div>
      </div>

      {/* Row: Status + Priority */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Status */}
        <div>
          <label className="text-xs font-medium text-slate-200 mb-1.5 block">
            {language === "en" ? "Status" : "स्थिति"}
          </label>
          <select
            multiple
            value={statuses}
            onChange={(e) =>
              setStatuses(Array.from(e.target.selectedOptions, (o) => o.value))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500/80 min-h-[2.5rem]"
            aria-label={
              language === "en" ? "Filter by status" : "स्थितिद्वारा फिल्टर"
            }
          >
            <option value="new">{language === "en" ? "New" : "नयाँ"}</option>
            <option value="in_progress">
              {language === "en" ? "In Progress" : "प्रक्रियामा"}
            </option>
            <option value="resolved">
              {language === "en" ? "Resolved" : "समाधान भएको"}
            </option>
            <option value="closed">
              {language === "en" ? "Closed" : "बन्द"}
            </option>
          </select>
          <p className="mt-1 text-[11px] text-slate-500">
            {language === "en"
              ? "Hold Ctrl/⌘ to select multiple."
              : "धेरै चयन गर्न Ctrl/⌘ थिचेर क्लिक गर्नुहोस्।"}
          </p>
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs font-medium text-slate-200 mb-1.5 block">
            {language === "en" ? "Priority" : "प्राथमिकता"}
          </label>
          <select
            multiple
            value={priorities}
            onChange={(e) =>
              setPriorities(
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500/80 min-h-[2.5rem]"
            aria-label={
              language === "en"
                ? "Filter by priority"
                : "प्राथमिकताद्वारा फिल्टर"
            }
          >
            <option value="low">{language === "en" ? "Low" : "कम"}</option>
            <option value="medium">
              {language === "en" ? "Medium" : "मध्यम"}
            </option>
            <option value="high">{language === "en" ? "High" : "उच्च"}</option>
            <option value="critical">
              {language === "en" ? "Critical" : "गम्भीर"}
            </option>
          </select>
        </div>
      </div>

      {/* Row: Date range */}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-200 mb-1.5 block">
            {language === "en" ? "From Date" : "मितिबाट"}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500/80"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-200 mb-1.5 block">
            {language === "en" ? "To Date" : "मितिसम्म"}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500/80"
          />
        </div>
      </div>

      {/* Hint + active summary */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 mt-2 pt-3">
        <p className="text-[11px] text-slate-500 flex-1">
          {language === "en"
            ? "Filters apply instantly to your complaints list."
            : "फिल्टरहरूले तपाईंको गुनासो सूचीमा तुरुन्त प्रभाव पार्छन्।"}
        </p>

        {isDirty && (
          <div className="flex flex-wrap gap-1 text-[11px] text-slate-300">
            <span className="rounded-full bg-slate-800/80 px-2 py-0.5">
              {language === "en" ? "Active filters" : "सक्रिय फिल्टर"}:{" "}
              {activeCount}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
