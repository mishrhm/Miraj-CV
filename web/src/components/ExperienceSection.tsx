"use client";

import { useEffect, useState } from "react";

type Experience = {
    id: string;
    organization: string;
    title: string;
    location: string | null;
    startDate: string; // ISO string
    endDate: string | null; // ISO string, or null = "currently work here"
    bullets: string[];
    isNew?: boolean; // true = not yet saved to the DB
};

function toMonthInput(iso: string | null): string {
    if (!iso) return "";
    return iso.slice(0, 7); // "YYYY-MM-DDTHH:..." -> "YYYY-MM"
}

function fromMonthInput(month: string): string {
    return month ? `${month}-01` : new Date().toISOString().slice(0, 10);
}

function blankExperience(): Experience {
    return {
        id: `temp-${Date.now()}`,
        organization: "",
        title: "",
        location: "",
        startDate: new Date().toISOString(),
        endDate: null,
        bullets: [""],
        isNew: true,
    };
}

export default function ExperienceSection() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/experiences")
            .then((res) => res.json())
            .then((data) => {
                setExperiences(data);
                setLoading(false);
            });
    }, []);

    function updateField<K extends keyof Experience>(
        id: string,
        field: K,
        value: Experience[K]
    ) {
        setExperiences((prev) =>
            prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
        );
    }

    function updateBullet(id: string, index: number, value: string) {
        setExperiences((prev) =>
            prev.map((exp) =>
                exp.id === id
                    ? { ...exp, bullets: exp.bullets.map((b, i) => (i === index ? value : b)) }
                    : exp
            )
        );
    }

    function addBullet(id: string) {
        setExperiences((prev) =>
            prev.map((exp) => (exp.id === id ? { ...exp, bullets: [...exp.bullets, ""] } : exp))
        );
    }

    function removeBullet(id: string, index: number) {
        setExperiences((prev) =>
            prev.map((exp) =>
                exp.id === id
                    ? { ...exp, bullets: exp.bullets.filter((_, i) => i !== index) }
                    : exp
            )
        );
    }

    function addExperience() {
        setExperiences((prev) => [...prev, blankExperience()]);
    }

    async function saveExperience(exp: Experience) {
        setSavingId(exp.id);
        const payload = {
            organization: exp.organization,
            title: exp.title,
            location: exp.location || null,
            startDate: exp.startDate,
            endDate: exp.endDate,
            bullets: exp.bullets.filter((b) => b.trim() !== ""),
        };

        if (exp.isNew) {
            const res = await fetch("/api/experiences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const saved = await res.json();
            setExperiences((prev) =>
                prev.map((e) => (e.id === exp.id ? { ...saved, isNew: false } : e))
            );
        } else {
            const res = await fetch(`/api/experiences/${exp.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const saved = await res.json();
            setExperiences((prev) => prev.map((e) => (e.id === exp.id ? saved : e)));
        }
        setSavingId(null);
    }

    async function deleteExperience(exp: Experience) {
        if (!exp.isNew) {
            await fetch(`/api/experiences/${exp.id}`, { method: "DELETE" });
        }
        setExperiences((prev) => prev.filter((e) => e.id !== exp.id));
    }

    if (loading) {
        return <div className="mt-8 h-32 animate-pulse rounded-lg bg-slate-200" />;
    }

    return (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-accent/20 pb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Experience
                </h2>
                <button onClick={addExperience} className="text-sm font-medium text-accent hover:underline">
                    + Add experience
                </button>
            </div>

            {experiences.length === 0 && (
                <p className="text-sm text-slate-500">No experience added yet.</p>
            )}

            <div className="space-y-6">
                {experiences.map((exp) => (
                    <div key={exp.id} className="rounded-md border border-slate-200 p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TextInput
                                label="Organization"
                                value={exp.organization}
                                onChange={(v) => updateField(exp.id, "organization", v)}
                            />
                            <TextInput
                                label="Title"
                                value={exp.title}
                                onChange={(v) => updateField(exp.id, "title", v)}
                            />
                            <TextInput
                                label="Location"
                                value={exp.location ?? ""}
                                onChange={(v) => updateField(exp.id, "location", v)}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700">Start</span>
                                    <input
                                        type="month"
                                        value={toMonthInput(exp.startDate)}
                                        onChange={(e) => updateField(exp.id, "startDate", fromMonthInput(e.target.value))}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700">End</span>
                                    <input
                                        type="month"
                                        value={toMonthInput(exp.endDate)}
                                        disabled={exp.endDate === null}
                                        onChange={(e) => updateField(exp.id, "endDate", fromMonthInput(e.target.value))}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:bg-slate-100"
                                    />
                                </label>
                            </div>
                        </div>

                        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={exp.endDate === null}
                                onChange={(e) =>
                                    updateField(exp.id, "endDate", e.target.checked ? null : new Date().toISOString())
                                }
                            />
                            I currently work here
                        </label>

                        <div className="mt-4">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">Bullets</span>
                            <div className="space-y-2">
                                {exp.bullets.map((bullet, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={bullet}
                                            onChange={(e) => updateBullet(exp.id, i, e.target.value)}
                                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                        />
                                        <button
                                            onClick={() => removeBullet(exp.id, i)}
                                            className="px-2 text-sm text-slate-400 hover:text-red-500"
                                            aria-label="Remove bullet"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addBullet(exp.id)} className="mt-2 text-sm font-medium text-accent hover:underline">
                                + Add bullet
                            </button>
                        </div>

                        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                            <button
                                onClick={() => saveExperience(exp)}
                                disabled={savingId === exp.id}
                                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light disabled:opacity-50"
                            >
                                {savingId === exp.id ? "Saving…" : "Save"}
                            </button>
                            <button onClick={() => deleteExperience(exp)} className="text-sm font-medium text-slate-500 hover:text-red-500">
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
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
        </label>
    );
}