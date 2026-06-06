"use client";

import { useState, useRef, useTransition } from "react";
import { createProject } from "@/app/(dashboard)/dashboard/projects/actions";
import { X, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function CreateProjectForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  }

  function handleSubmit(formData: FormData) {
    setStatus("idle");
    setErrorMsg(null);
    startTransition(async () => {
      const result = await createProject(formData);
      if (result?.error) {
        setStatus("error");
        setErrorMsg(result.error);
      } else {
        setStatus("success");
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
          setCoverPreview(null);
          formRef.current?.reset();
        }, 1500);
      }
    });
  }

  return (
    <>
      {/* Hidden checkbox toggle */}
      <input
        type="checkbox"
        id="create-project-toggle"
        className="hidden"
        checked={isOpen}
        onChange={(e) => setIsOpen(e.target.checked)}
        readOnly
      />

      {/* Drawer / slide-down panel */}
      {isOpen && (
        <div className="bg-surface border border-border rounded-2xl shadow-lg overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between p-5 border-b border-border bg-slate-50 dark:bg-[#0F172A]">
            <h2 className="font-semibold text-foreground">Create New Project</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form ref={formRef} action={handleSubmit} className="p-5 space-y-5">
            {status === "success" && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Project created! Refreshing…
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Title */}
              <div className="sm:col-span-2">
                <label htmlFor="project-title" className="block text-sm font-medium text-foreground mb-1.5">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="project-title"
                  name="title"
                  required
                  placeholder="e.g. Borehole Water Installation"
                  className="w-full px-4 py-2.5 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label htmlFor="project-desc" className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  id="project-desc"
                  name="description"
                  rows={3}
                  placeholder="Describe the project and how funds will be used…"
                  className="w-full px-4 py-2.5 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-sm resize-none"
                />
              </div>

              {/* Goal amount */}
              <div>
                <label htmlFor="project-goal" className="block text-sm font-medium text-foreground mb-1.5">
                  Goal Amount (ZAR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">R</span>
                  <input
                    id="project-goal"
                    name="goal_amount"
                    type="number"
                    min={100}
                    step={100}
                    required
                    placeholder="50000"
                    className="w-full pl-9 pr-4 py-2.5 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Cover Image <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-border rounded-xl overflow-hidden transition-colors hover:border-[#D4AF37]"
                  style={{ height: "80px" }}
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-1 text-muted-foreground">
                      <Upload className="w-5 h-5" />
                      <span className="text-xs">Upload image</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  name="cover_image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || status === "success"}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary-light transition-colors disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
