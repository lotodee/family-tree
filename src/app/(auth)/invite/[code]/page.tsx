"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { COLORS } from "@/lib/config/design";
import { ROLE_DEFAULTS, formatVideoLimit } from "@/lib/config/roles";
import type { MembershipRole } from "@/types";

interface InviteData {
  valid: boolean;
  isUsed: boolean;
  isExpired: boolean;
  celebration: {
    name: string;
    description: string | null;
    eventDate: string | null;
    slug: string;
  };
  invitedBy: string;
  role: MembershipRole;
  targetNodeName: string | null;
}

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<"not_found" | "unknown" | null>(null);
  const hasAutoRedeemed = useRef(false);

  // Fetch invite details on mount
  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invitations/${code}`);
        if (!res.ok) {
          if (res.status === 404) setError("not_found");
          else setError("unknown");
          return;
        }
        const data = await res.json();
        setInvite(data);
      } catch {
        setError("unknown");
      } finally {
        setIsLoading(false);
      }
    }

    // Also check if user is logged in
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    }

    fetchInvite();
    checkAuth();
  }, [code]);

  const handleJoin = useCallback(async () => {
    if (!isLoggedIn) {
      // Redirect to register with the invite code and redirect back here
      router.push(`/register?redirect=/invite/${code}&code=${code}`);
      return;
    }

    // User is logged in — redeem immediately
    setIsRedeeming(true);
    try {
      const res = await fetch("/api/invitations/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.slug) {
          // Already a member — redirect to the celebration
          toast.info("You're already a member of this celebration");
          router.push(`/c/${data.slug}`);
          return;
        }
        toast.error(data.error || "Failed to join");
        setIsRedeeming(false);
        return;
      }

      toast.success(`Welcome to ${data.celebrationName}!`);
      router.push(`/c/${data.slug}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsRedeeming(false);
    }
  }, [isLoggedIn, code, router]);

  // Auto-redeem when user comes back from registration
  useEffect(() => {
    if (isLoggedIn && invite?.valid && !isRedeeming && !hasAutoRedeemed.current) {
      hasAutoRedeemed.current = true;
      handleJoin();
    }
  }, [isLoggedIn, invite, isRedeeming, handleJoin]);

  // Format event date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.cream }}>
        <Loading centered text="Loading invitation..." />
      </div>
    );
  }

  // Error states
  if (error === "not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: COLORS.cream }}>
        <Card className="max-w-md w-full text-center p-8">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: COLORS.textPrimary }}
          >
            Invite Not Found
          </h1>
          <p className="mb-6" style={{ color: COLORS.textSecondary }}>
            We couldn't find this invite. Check your link and try again.
          </p>
          <Link href="/">
            <Button variant="secondary" fullWidth>
              Go Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (error === "unknown") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: COLORS.cream }}>
        <Card className="max-w-md w-full text-center p-8">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: COLORS.textPrimary }}
          >
            Something Went Wrong
          </h1>
          <p className="mb-6" style={{ color: COLORS.textSecondary }}>
            We had trouble loading this invite. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} fullWidth>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Invite already used
  if (invite?.isUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: COLORS.cream }}>
        <Card className="max-w-md w-full text-center p-8">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: COLORS.textPrimary }}
          >
            Invite Already Used
          </h1>
          <p className="mb-6" style={{ color: COLORS.textSecondary }}>
            This invite has already been used. If this was you, head to your dashboard.
          </p>
          <Link href="/dashboard">
            <Button fullWidth>Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Invite expired
  if (invite?.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: COLORS.cream }}>
        <Card className="max-w-md w-full text-center p-8">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: COLORS.textPrimary }}
          >
            Invite Expired
          </h1>
          <p className="mb-6" style={{ color: COLORS.textSecondary }}>
            This invite has expired. Ask the person who invited you for a new link.
          </p>
          <Link href="/">
            <Button variant="secondary" fullWidth>
              Go Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Valid invite
  if (!invite) return null;

  const roleConfig = ROLE_DEFAULTS[invite.role];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: COLORS.cream }}>
      <Card className="max-w-md w-full p-8">
        {/* Header */}
        <p
          className="text-sm text-center mb-2"
          style={{ color: COLORS.textSecondary }}
        >
          You're invited to
        </p>
        <h1
          className="text-3xl font-bold text-center mb-2"
          style={{ fontFamily: "var(--font-display)", color: COLORS.burgundy }}
        >
          {invite.celebration.name}
        </h1>

        {/* Event date */}
        {invite.celebration.eventDate && (
          <p
            className="text-center mb-4"
            style={{ color: COLORS.gold, fontWeight: 500 }}
          >
            {formatDate(invite.celebration.eventDate)}
          </p>
        )}

        {/* Description */}
        {invite.celebration.description && (
          <p
            className="text-center mb-6 italic"
            style={{ color: COLORS.textSecondary }}
          >
            "{invite.celebration.description}"
          </p>
        )}

        {/* Invite details */}
        <div
          className="border-t border-b py-4 my-4 space-y-2"
          style={{ borderColor: COLORS.goldLight }}
        >
          <div className="flex justify-between text-sm">
            <span style={{ color: COLORS.textSecondary }}>Invited by</span>
            <span style={{ color: COLORS.textPrimary, fontWeight: 500 }}>
              {invite.invitedBy}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: COLORS.textSecondary }}>Your role</span>
            <span style={{ color: COLORS.textPrimary, fontWeight: 500 }}>
              {roleConfig.label}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: COLORS.textSecondary }}>Video limit</span>
            <span style={{ color: COLORS.textPrimary, fontWeight: 500 }}>
              {formatVideoLimit(roleConfig.video_limit_secs)}
            </span>
          </div>
          {invite.targetNodeName && (
            <div className="flex justify-between text-sm">
              <span style={{ color: COLORS.textSecondary }}>You'll be assigned to</span>
              <span style={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                {invite.targetNodeName}
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          onClick={handleJoin}
          isLoading={isRedeeming}
          fullWidth
          size="lg"
        >
          {isLoggedIn ? "Join This Celebration" : "Join This Celebration"}
        </Button>

        {/* Sign in link */}
        {!isLoggedIn && (
          <p
            className="text-center text-sm mt-4"
            style={{ color: COLORS.textSecondary }}
          >
            Already have an account?{" "}
            <Link
              href={`/login?redirect=/invite/${code}&code=${code}`}
              className="underline"
              style={{ color: COLORS.burgundy }}
            >
              Sign in
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
