"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Users, Plus, PartyPopper } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/lib/config/design";
import type { CelebrationCardData } from "./page";

interface DashboardClientProps {
  avatarUrl: string | null;
  firstName: string;
  greeting: string;
  celebrations: CelebrationCardData[];
}

// Role badge colors
const roleBadgeStyles: Record<string, { bg: string; text: string }> = {
  owner: { bg: COLORS.gold, text: COLORS.textPrimary },
  admin: { bg: COLORS.burgundy, text: COLORS.white },
  member: { bg: COLORS.goldLight, text: COLORS.textPrimary },
  viewer: { bg: "#E5E5E5", text: COLORS.textSecondary },
};

function formatEventDate(dateString: string | null): string {
  if (!dateString) return "No date set";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RoleBadge({ role }: { role: string }) {
  const styles = roleBadgeStyles[role] || roleBadgeStyles.viewer;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      {role}
    </span>
  );
}

export function DashboardClient({
  firstName,
  greeting,
  celebrations,
}: DashboardClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationsReady, setAnimationsReady] = useState(false);

  useEffect(() => {
    setAnimationsReady(true);
  }, []);

  // GSAP entrance animations
  useGSAP(
    () => {
      if (!animationsReady) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Hero section entrance
      tl.from(".hero-greeting", {
        opacity: 0,
        y: 20,
        duration: 0.6,
      })
        .from(
          ".hero-name",
          {
            opacity: 0,
            y: 30,
            duration: 0.7,
          },
          "-=0.4"
        )
        // Celebration cards stagger
        .from(
          ".celebration-card",
          {
            opacity: 0,
            y: 40,
            scale: 0.95,
            stagger: 0.12,
            duration: 0.6,
          },
          "-=0.3"
        )
        // Empty state or create button
        .from(
          ".empty-state, .create-button",
          {
            opacity: 0,
            y: 30,
            duration: 0.5,
          },
          "-=0.2"
        );
    },
    { scope: containerRef, dependencies: [animationsReady] }
  );

  // Card hover animations
  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleCardHover = contextSafe((e: React.MouseEvent, isEntering: boolean) => {
    gsap.to(e.currentTarget, {
      scale: isEntering ? 1.02 : 1,
      y: isEntering ? -4 : 0,
      boxShadow: isEntering
        ? "0 12px 24px rgba(196,151,59,0.15)"
        : "0 1px 3px rgba(0,0,0,0.08)",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  const hasCelebrations = celebrations.length > 0;

  return (
    <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
      {/* Hero Section */}
      <div
        className="px-6 pb-8 pt-8"
        style={{
          background: `linear-gradient(135deg, ${COLORS.burgundy} 0%, ${COLORS.burgundyLight} 100%)`,
        }}
      >
        <p
          className="hero-greeting text-sm font-medium"
          style={{ color: COLORS.goldLight }}
        >
          {greeting}
        </p>
        <h1
          className="hero-name mt-1 font-display text-3xl font-bold"
          style={{ color: COLORS.ivory }}
        >
          {firstName}
        </h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-display font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            Your Celebrations
          </h2>
          {hasCelebrations && (
            <Link href="/create">
              <Button size="sm" variant="secondary" className="create-button">
                <Plus size={16} />
                New
              </Button>
            </Link>
          )}
        </div>

        {hasCelebrations ? (
          /* Celebration Cards */
          <div className="space-y-4">
            {celebrations.map((celebration) => (
              <Link
                key={celebration.id}
                href={`/c/${celebration.slug}/manage`}
                className="block"
              >
                <Card
                  className="celebration-card cursor-pointer"
                  onMouseEnter={(e) => handleCardHover(e, true)}
                  onMouseLeave={(e) => handleCardHover(e, false)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-display font-semibold text-lg"
                          style={{ color: COLORS.textPrimary }}
                        >
                          {celebration.name}
                        </h3>
                        <RoleBadge role={celebration.role} />
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <div
                          className="flex items-center gap-1.5 text-sm"
                          style={{ color: COLORS.textSecondary }}
                        >
                          <Calendar size={14} />
                          {formatEventDate(celebration.eventDate)}
                        </div>
                        <div
                          className="flex items-center gap-1.5 text-sm"
                          style={{ color: COLORS.textSecondary }}
                        >
                          <Users size={14} />
                          {celebration.memberCount} member
                          {celebration.memberCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    {/* Optional cover image thumbnail */}
                    {celebration.coverImageUrl && (
                      <div
                        className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0 ml-4"
                        style={{
                          backgroundImage: `url(${celebration.coverImageUrl})`,
                        }}
                      />
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="empty-state text-center py-12">
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ backgroundColor: COLORS.goldLight }}
            >
              <PartyPopper size={36} style={{ color: COLORS.burgundy }} />
            </div>
            <h3
              className="font-display text-xl font-semibold mb-2"
              style={{ color: COLORS.textPrimary }}
            >
              No celebrations yet
            </h3>
            <p
              className="text-sm mb-6 max-w-xs mx-auto"
              style={{ color: COLORS.textSecondary }}
            >
              Create your first celebration to start building your family tree and
              collecting memories.
            </p>
            <Link href="/create">
              <Button size="lg">
                <Plus size={20} />
                Create Your First Celebration
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
