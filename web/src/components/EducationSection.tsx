"use client";

import { useEffect, useState } from "react";

type EducationEntry = {
    id: string;
    institution: string;
    degree: string;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    notes: string | null;
    isNew?: boolean;
};

function toMonthInput(iso: string | null): string {
    if (!iso) return "";
    return iso.slice(0, 7);
}

function fromMonthInput(month: string): string | null {
    return month ? `${month}-01` : null;
}

function blankEducation(): EducationEntry {
    return {
        id: `temp-${Date.now()}`,
        institution: "",
        degree: "",
        field: "",
        startDate: null,
        endDate: null,
        notes: "",
        isNew: true,
    };
}

export default function EducationSection() {
    const [entries, setEntries] = useState<EducationEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/education")
            .then((res) => res.json())
            .then((data) => {
                setEntries(data);
                setLoading(false);
            });
    }, []);

    function updateField<K extends keyof EducationEntry>(
        id: string,
        field: K,
        value: EducationEntry[K]
    ) {
        setEntries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
        );
    }

    function addEntry() {
        setEntries((prev) => [...prev, blankEducation()]);
    }

    async function saveEntry(entry: EducationEntry) {
        setSavingId(entry.id);
        const payload = {
            institution: entry.institution,
            degree: entry.degree,
            field: entry.field || null,
            startDate: entry.startDate,
            endDate: entry.endDate,
            notes: entry.notes || null,
        };

        if (entry.isNew) {
            const res = await fetch("/api/education", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const saved = await res.json();
            setEntries((prev) =>
                prev.map((e) => (e.id === entry.id ? { ...saved, isNew: false } : e))
            );
        } else {
            const res = await fetch(`/api/education/${entry.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const saved = await res.json();
            setEntries((prev) => prev.map((e) => (e.id === entry.id ? saved : e)));
        }
        setSavingId(null);
    }

    async function deleteEntry(entry: EducationEntry) {
        if (!entry.isNew) {
            await fetch(`/api/education/${entry.id}`, { method: "DELETE" });
        }
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    }

    if (loading) {
        return <div className="mt-8 h-32 animate-pulse rounded-lg bg-slate-200" />;
    }

    return (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-accent/20 pb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Education
                </h2>
                <button onClick={addEntry} className="text-sm font-medium text-accent hover:underline">
                    + Add education
                </button>
            </div>

            {entries.length === 0 && (
                <p className="text-sm text-slate-500">No education added yet.</p>
            )}

            <div className="space-y-6">
                {entries.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-slate-200 p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TextInput
                                label="Institution"
                                value={entry.institution}
                                onChange={(v) => updateField(entry.id, "institution", v)}
                            />
                            <TextInput
                                label="Degree"
                                value={entry.degree}
                                onChange={(v) => updateField(entry.id, "degree", v)}
                                placeholder="B.Tech"
                            />
                            <TextInput
                                label="Field of study"
                                value={entry.field ?? ""}
                                onChange={(v) => updateField(entry.id, "field", v)}
                                placeholder="Software Engineering"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700">Start</span>
                                    <input
                                        type="month"
                                        value={toMonthInput(entry.startDate)}
                                        onChange={(e) => updateField(entry.id, "startDate", fromMonthInput(e.target.value))}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700">End</span>
                                    <input
                                        type="month"
                                        value={toMonthInput(entry.endDate)}
                                        onChange={(e) => updateField(entry.id, "endDate", fromMonthInput(e.target.value))}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                    />
                                </label>
                            </div>
                        </div>

                        <label className="mt-4 block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">Notes (optional)</span>
                            <textarea
                                value={entry.notes ?? ""}
                                onChange={(e) => updateField(entry.id, "notes", e.target.value)}
                                rows={2}
                                className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                            />
                        </label>

                        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                            <button
                                onClick={() => saveEntry(entry)}
                                disabled={savingId === entry.id}
                                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light disabled:opacity-50"
                            >
                                {savingId === entry.id ? "Saving…" : "Save"}
                            </button>
                            <button onClick={() => deleteEntry(entry)} className="text-sm font-medium text-slate-500 hover:text-red-500">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TextInput({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
        </label>
    );
}