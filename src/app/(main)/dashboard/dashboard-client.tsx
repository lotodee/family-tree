"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { RopeBoard } from "@/components/ui/rope-board";
import { AvatarUploadPrompt } from "@/components/ui/avatar-upload-prompt";
import { gsap, useGSAP } from "@/lib/gsap/config";

interface DashboardClientProps {
  avatarUrl: string | null;
  firstName: string;
  greeting: string;
  generationLabel: string;
  progress: number;
  answered: number;
  total: number;
  remaining: number;
  joined: number;
  profileNodeId: string;
}

// Progress ring component with GSAP animation
function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
  animate = false,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  animate?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressRef = useRef<SVGCircleElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!animate || !progressRef.current || !percentRef.current) return;

    // Animate the ring drawing
    gsap.fromTo(
      progressRef.current,
      { strokeDashoffset: circumference },
      {
        strokeDashoffset: circumference - (progress / 100) * circumference,
        duration: 1.5,
        ease: "power2.out",
        delay: 0.8,
      }
    );

    // Animate the percentage counter
    const obj = { val: 0 };
    gsap.to(obj, {
      val: progress,
      duration: 1.5,
      ease: "power2.out",
      delay: 0.8,
      onUpdate: () => {
        if (percentRef.current) {
          percentRef.current.textContent = `${Math.round(obj.val)}%`;
        }
      },
    });
  }, [animate, progress, circumference]);

  return (
    <div className="relative flex-shrink-0">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-gold-light)"
          strokeWidth={strokeWidth}
        />
        <circle
          ref={progressRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : circumference - (progress / 100) * circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span ref={percentRef} className="text-2xl font-bold text-burgundy">
          {animate ? "0%" : `${progress}%`}
        </span>
      </div>
    </div>
  );
}

export function DashboardClient({
  avatarUrl,
  firstName,
  greeting,
  generationLabel,
  progress,
  answered,
  total,
  remaining,
  joined,
  profileNodeId,
}: DashboardClientProps) {
  const [showUploadBoard, setShowUploadBoard] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(!!avatarUrl);
  const [animationsReady, setAnimationsReady] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Show the board after a short delay if no avatar
  useEffect(() => {
    if (!hasAvatar) {
      const timer = setTimeout(() => setShowUploadBoard(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasAvatar]);

  // Mark animations ready after mount
  useEffect(() => {
    setAnimationsReady(true);
  }, []);

  // GSAP animations
  useGSAP(
    () => {
      if (!animationsReady) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Hero text entrance
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
        .from(
          ".hero-label",
          {
            opacity: 0,
            y: 15,
            duration: 0.5,
          },
          "-=0.4"
        )
        // Progress card slide up
        .from(
          ".progress-card",
          {
            opacity: 0,
            y: 60,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.3"
        )
        // Quick actions stagger
        .from(
          ".action-card",
          {
            opacity: 0,
            y: 40,
            scale: 0.95,
            stagger: 0.15,
            duration: 0.6,
          },
          "-=0.4"
        )
        // Footer text
        .from(
          ".footer-text",
          {
            opacity: 0,
            y: 20,
            duration: 0.5,
          },
          "-=0.2"
        );
    },
    { scope: containerRef, dependencies: [animationsReady] }
  );

  // Hover animations for cards
  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleCardHover = contextSafe((e: React.MouseEvent, isEntering: boolean) => {
    gsap.to(e.currentTarget, {
      scale: isEntering ? 1.03 : 1,
      y: isEntering ? -4 : 0,
      boxShadow: isEntering
        ? "0 12px 24px rgba(0,0,0,0.12)"
        : "0 1px 3px rgba(0,0,0,0.08)",
      duration: 0.3,
      ease: "power2.out",
    });
  });

  const handleButtonHover = contextSafe((e: React.MouseEvent, isEntering: boolean) => {
    gsap.to(e.currentTarget, {
      scale: isEntering ? 1.02 : 1,
      duration: 0.2,
      ease: "power2.out",
    });

    // Animate the arrow
    const arrow = e.currentTarget.querySelector(".button-arrow");
    if (arrow) {
      gsap.to(arrow, {
        x: isEntering ? 4 : 0,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  });

  const handleUploaded = () => {
    setHasAvatar(true);
    setShowUploadBoard(false);
    router.refresh();
  };

  const handleDismiss = () => {
    setShowUploadBoard(false);
  };

  return (
    <>
      {/* Rope board for image upload */}
      <RopeBoard isOpen={showUploadBoard} onDismiss={handleDismiss}>
        <AvatarUploadPrompt onUploaded={handleUploaded} onDismiss={handleDismiss} />
      </RopeBoard>

      {/* Dashboard content */}
      <div ref={containerRef} className="bg-cream pb-24 overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-burgundy to-burgundy-light px-6 pb-16 pt-8 text-ivory">
          <p className="hero-greeting text-sm font-medium text-gold-light">{greeting}</p>
          <h1 className="hero-name mt-1 font-display text-3xl font-bold">{firstName}</h1>
          <p className="hero-label mt-1 text-sm text-ivory/70">{generationLabel}</p>
        </div>

        {/* Progress Card - Overlapping Hero */}
        <div className="-mt-10 px-4">
          <div className="progress-card rounded-2xl bg-ivory p-6 shadow-lg">
            <div className="flex items-center gap-6">
              {/* Progress Ring */}
              <ProgressRing progress={progress} size={100} strokeWidth={8} animate={animationsReady} />

              {/* Progress Text */}
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold text-text-primary">Your Stories</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {answered} of {total} questions answered
                </p>
                {remaining > 0 ? (
                  <p className="mt-2 text-xs text-gold">{remaining} more to complete your story</p>
                ) : (
                  <p className="mt-2 flex items-center gap-1 text-xs text-success">
                    <Sparkles className="h-3 w-3" />
                    All done! Thank you!
                  </p>
                )}
              </div>
            </div>

            {/* CTA Button */}
            {remaining > 0 && (
              <Link
                href="/questions"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-burgundy py-3.5 font-semibold text-ivory transition-all active:scale-[0.98]"
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Continue Sharing
                <ArrowRight className="button-arrow h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 px-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Explore
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Family Tree */}
            <Link href="/tree" className="group">
              <div
                className="action-card rounded-xl border border-gold/20 bg-ivory p-4"
                onMouseEnter={(e) => handleCardHover(e, true)}
                onMouseLeave={(e) => handleCardHover(e, false)}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-light">
                  <Users className="h-5 w-5 text-burgundy" />
                </div>
                <h4 className="font-display font-semibold text-text-primary">Family Tree</h4>
                <p className="mt-0.5 text-xs text-text-secondary">{joined} of 37 joined</p>
              </div>
            </Link>

            {/* Your Profile */}
            <Link href={`/profile/${profileNodeId}`} className="group">
              <div
                className="action-card rounded-xl border border-gold/20 bg-ivory p-4"
                onMouseEnter={(e) => handleCardHover(e, true)}
                onMouseLeave={(e) => handleCardHover(e, false)}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-light">
                  <span className="text-lg font-bold text-burgundy">{firstName.charAt(0)}</span>
                </div>
                <h4 className="font-display font-semibold text-text-primary">Your Profile</h4>
                <p className="mt-0.5 text-xs text-text-secondary">View your page</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Encouragement */}
        <div className="mt-8 px-4 text-center">
          <p className="footer-text text-sm text-text-secondary">
            Every story you share becomes part of our family&apos;s history
          </p>
        </div>
      </div>
    </>
  );
}
