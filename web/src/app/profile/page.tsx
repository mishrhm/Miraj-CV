"use client";
import { useEffect, useState } from "react";
import ExperienceSection from "@/components/ExperienceSection";
import EducationSection from "@/components/EducationSection";

type ProfileForm = {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    summary: string;
};

const EMPTY_FORM: ProfileForm = {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
};

export default function ProfilePage() {
    const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => res.json())
            .then((data) => {
                setForm({
                    fullName: data.fullName ?? "",
                    headline: data.headline ?? "",
                    email: data.email ?? "",
                    phone: data.phone ?? "",
                    location: data.location ?? "",
                    linkedin: data.linkedin ?? "",
                    github: data.github ?? "",
                    summary: data.summary ?? "",
                });
                setLoading(false);
            });
    }, []);

    function handleChange(field: keyof ProfileForm, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSave() {
        setSaving(true);
        setSavedAt(null);
        await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setSaving(false);
        setSavedAt(new Date().toLocaleTimeString());
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
                <div className="h-64 animate-pulse rounded-lg bg-slate-200" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
            <p className="mt-1 text-sm text-slate-500">
                Your canonical resume data — the source of truth every tailored
                resume gets generated from.
            </p>

            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                <SectionLabel>Basics</SectionLabel>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                        label="Full name"
                        value={form.fullName}
                        onChange={(v) => handleChange("fullName", v)}
                    />
                    <Field
                        label="Headline"
                        value={form.headline}
                        onChange={(v) => handleChange("headline", v)}
                        placeholder="Founding CTO / Full-Stack Engineer"
                    />
                </div>

                <SectionLabel className="mt-8">Contact</SectionLabel>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                        label="Email"
                        value={form.email}
                        onChange={(v) => handleChange("email", v)}
                    />
                    <Field
                        label="Phone"
                        value={form.phone}
                        onChange={(v) => handleChange("phone", v)}
                    />
                    <Field
                        label="Location"
                        value={form.location}
                        onChange={(v) => handleChange("location", v)}
                        placeholder="Dubai, UAE"
                    />
                    <Field
                        label="LinkedIn"
                        value={form.linkedin}
                        onChange={(v) => handleChange("linkedin", v)}
                    />
                    <Field
                        label="GitHub"
                        value={form.github}
                        onChange={(v) => handleChange("github", v)}
                    />
                </div>

                <SectionLabel className="mt-8">Summary</SectionLabel>
                <textarea
                    value={form.summary}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                />

                <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save"}
                    </button>
                    {savedAt && (
                        <span className="text-sm text-slate-500">Saved at {savedAt}</span>
                    )}
                </div>
            </div>
            <ExperienceSection />
            <EducationSection />
        </div>
    );
}

// Echoes the docx template's section-heading style (uppercase, tracking-wide,
// accent underline) so the form visually previews what the resume will look like.
function SectionLabel({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h2
            className={`mb-4 border-b border-accent/20 pb-2 text-xs font-semibold uppercase tracking-wider text-accent ${className}`}
        >
            {children}
        </h2>
    );
}

function Field({
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
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
                {label}
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />
        </label>
    );
}