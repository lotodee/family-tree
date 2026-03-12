"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/lib/config/design";

const createCelebrationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  event_date: z.string().optional(),
  slug: z
    .string()
    .min(3, "URL must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "URL can only contain lowercase letters, numbers, and hyphens"
    ),
});

type FormData = z.infer<typeof createCelebrationSchema>;

// Convert name to URL-safe slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

export default function CreateCelebrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    event_date: "",
    slug: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && formData.name) {
      const newSlug = generateSlug(formData.name);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [formData.name, slugManuallyEdited]);

  // Debounced slug uniqueness check
  const checkSlugUniqueness = useCallback(async (slug: string) => {
    if (slug.length < 3) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");

    try {
      const response = await fetch(`/api/celebrations/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();

      if (data.available) {
        setSlugStatus("available");
      } else {
        setSlugStatus("taken");
      }
    } catch {
      setSlugStatus("idle");
    }
  }, []);

  // Trigger slug check with debounce
  useEffect(() => {
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    if (formData.slug.length >= 3) {
      const timeout = setTimeout(() => {
        checkSlugUniqueness(formData.slug);
      }, 500);
      setCheckTimeout(timeout);
    } else {
      setSlugStatus("idle");
    }

    return () => {
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.slug]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, slug: value }));
    setSlugManuallyEdited(true);
    setErrors((prev) => ({ ...prev, slug: undefined }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, event_date: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const result = createCelebrationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Check if slug is taken
    if (slugStatus === "taken") {
      setErrors((prev) => ({ ...prev, slug: "This URL is already taken" }));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/celebrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          event_date: formData.event_date || null,
          slug: formData.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create celebration");
        return;
      }

      toast.success("Celebration created!");
      router.push(`/c/${data.celebration.slug}/manage`);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: COLORS.cream }}>
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-opacity"
          style={{ color: COLORS.textSecondary }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="font-display text-3xl font-bold"
            style={{ color: COLORS.textPrimary }}
          >
            Create a Celebration
          </h1>
          <p className="mt-2" style={{ color: COLORS.textSecondary }}>
            Start by giving your celebration a name. You can add more details later.
          </p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <Input
              label="Celebration Name"
              placeholder="e.g., Grandpa's 100th Birthday"
              value={formData.name}
              onChange={handleNameChange}
              error={errors.name}
              autoFocus
              required
            />

            {/* Slug / URL */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: COLORS.textPrimary }}
              >
                Celebration URL
              </label>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm whitespace-nowrap"
                  style={{ color: COLORS.textSecondary }}
                >
                  {baseUrl}/c/
                </span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="celebration-url"
                    className="w-full h-12 px-4 pr-10 rounded-lg border text-base outline-none transition-colors focus:border-[var(--color-gold)] focus:shadow-[0_0_0_3px_rgba(196,151,59,0.1)]"
                    style={{
                      backgroundColor: COLORS.ivory,
                      borderColor: errors.slug ? COLORS.error : COLORS.goldLight,
                      color: COLORS.textPrimary,
                    }}
                  />
                  {/* Status indicator */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {slugStatus === "checking" && (
                      <Loader2 size={18} className="animate-spin" style={{ color: COLORS.textSecondary }} />
                    )}
                    {slugStatus === "available" && (
                      <Check size={18} style={{ color: COLORS.success }} />
                    )}
                    {slugStatus === "taken" && (
                      <X size={18} style={{ color: COLORS.error }} />
                    )}
                  </div>
                </div>
              </div>
              {errors.slug && (
                <p className="mt-1.5 text-sm" style={{ color: COLORS.error }}>
                  {errors.slug}
                </p>
              )}
              {slugStatus === "taken" && !errors.slug && (
                <p className="mt-1.5 text-sm" style={{ color: COLORS.error }}>
                  This URL is already taken. Try a different one.
                </p>
              )}
            </div>

            {/* Event Date */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: COLORS.textPrimary }}
              >
                Event Date (optional)
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={handleDateChange}
                className="w-full h-12 px-4 rounded-lg border text-base outline-none transition-colors focus:border-[var(--color-gold)] focus:shadow-[0_0_0_3px_rgba(196,151,59,0.1)]"
                style={{
                  backgroundColor: COLORS.ivory,
                  borderColor: COLORS.goldLight,
                  color: COLORS.textPrimary,
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: COLORS.textPrimary }}
              >
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Tell your family what this celebration is about..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border text-base outline-none transition-colors resize-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_3px_rgba(196,151,59,0.1)]"
                style={{
                  backgroundColor: COLORS.ivory,
                  borderColor: COLORS.goldLight,
                  color: COLORS.textPrimary,
                }}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={slugStatus === "taken"}
            >
              Create Celebration
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
