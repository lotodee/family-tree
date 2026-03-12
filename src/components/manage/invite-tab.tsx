"use client";

import { useState, useEffect, useCallback } from "react";
import { useCelebration } from "@/lib/contexts/celebration-context";
import {
  ROLE_DEFAULTS,
  formatVideoLimit,
  getRoleBadgeColor,
} from "@/lib/config/roles";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { COLORS } from "@/lib/config/design";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import type { MembershipRole, FamilyTreeNode } from "@/types";

interface Invitation {
  id: string;
  code: string;
  role: MembershipRole;
  video_limit_secs: number;
  can_invite: boolean;
  can_add_to_tree: boolean;
  is_used: boolean;
  used_by: string | null;
  target_node_id: string | null;
  target_node: { display_name: string } | null;
  created_at: string;
}

interface InviteTabProps {
  nodes: FamilyTreeNode[];
}

export function InviteTab({ nodes }: InviteTabProps) {
  const { celebration, membership } = useCelebration();
  const [selectedRole, setSelectedRole] = useState<MembershipRole>("member");
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const canInvite = membership.can_invite;
  const isOwner = membership.role === "owner";

  // Roles that can be invited (not owner)
  const invitableRoles: { role: MembershipRole; allowed: boolean }[] = [
    { role: "admin", allowed: isOwner },
    { role: "member", allowed: true },
    { role: "viewer", allowed: true },
  ];

  // Unclaimed nodes for assignment
  const unclaimedNodes = nodes.filter((n) => !n.is_claimed);

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/invitations?celebrationId=${celebration.id}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const { invitations: fetched } = await res.json();
      setInvitations(fetched);
    } catch {
      toast.error("Failed to load invitations");
    } finally {
      setIsLoadingInvitations(false);
    }
  }, [celebration.id]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Generate invite link
  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const defaults = ROLE_DEFAULTS[selectedRole];
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          celebrationId: celebration.id,
          role: selectedRole,
          videoLimitSecs: defaults.video_limit_secs,
          canInvite: defaults.can_invite,
          canAddToTree: defaults.can_add_to_tree,
          canDelete: defaults.can_delete,
          targetNodeId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to generate invite");
        return;
      }

      const { invitation } = await res.json();
      const link = `${window.location.origin}/invite/${invitation.code}`;
      setGeneratedLink(link);
      toast.success("Invite link generated!");
      fetchInvitations();
    } catch {
      toast.error("Failed to generate invite");
    } finally {
      setIsGenerating(false);
    }
  }

  // Copy to clipboard
  async function copyLink(link: string, code?: string) {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied! Send it to your family member.");
      if (code) {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
      }
    } catch {
      toast.info("Copy this link: " + link);
    }
  }

  // Format date
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (!canInvite) {
    return (
      <div
        className="text-center py-16"
        style={{ color: COLORS.textSecondary }}
      >
        You don't have permission to invite members.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Generate New Invite Section */}
      <Card className="p-6">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: COLORS.textPrimary }}
        >
          Generate New Invite
        </h3>

        {/* Role Selection */}
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: COLORS.textPrimary }}
          >
            Role
          </label>
          <div className="flex gap-2 flex-wrap">
            {invitableRoles.map(({ role, allowed }) => {
              if (!allowed) return null;
              const config = ROLE_DEFAULTS[role];
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-[var(--color-gold)]"
                      : "hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor: isSelected ? COLORS.gold : COLORS.ivory,
                    color: COLORS.textPrimary,
                    border: `1px solid ${isSelected ? COLORS.gold : COLORS.goldLight}`,
                  }}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
          <p
            className="mt-2 text-sm"
            style={{ color: COLORS.textSecondary }}
          >
            {ROLE_DEFAULTS[selectedRole].description} •{" "}
            {formatVideoLimit(ROLE_DEFAULTS[selectedRole].video_limit_secs)} video
          </p>
        </div>

        {/* Tree Node Assignment */}
        {unclaimedNodes.length > 0 && (
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: COLORS.textPrimary }}
            >
              Assign to tree node (optional)
            </label>
            <select
              value={targetNodeId || ""}
              onChange={(e) => setTargetNodeId(e.target.value || null)}
              className="w-full h-10 px-3 rounded-lg border text-sm"
              style={{
                backgroundColor: COLORS.ivory,
                borderColor: COLORS.goldLight,
                color: COLORS.textPrimary,
              }}
            >
              <option value="">No assignment</option>
              {unclaimedNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.display_name}
                </option>
              ))}
            </select>
            <p
              className="mt-1 text-xs"
              style={{ color: COLORS.textSecondary }}
            >
              The person will be assigned to this node when they join
            </p>
          </div>
        )}

        {/* Generate Button */}
        <Button onClick={handleGenerate} isLoading={isGenerating}>
          <LinkIcon size={16} className="mr-2" />
          Generate Invite Link
        </Button>

        {/* Generated Link Display */}
        {generatedLink && (
          <div
            className="mt-4 p-4 rounded-lg flex items-center justify-between gap-3"
            style={{
              backgroundColor: COLORS.ivory,
              border: `1px solid ${COLORS.goldLight}`,
            }}
          >
            <div className="min-w-0 flex-1">
              <p
                className="text-xs mb-1"
                style={{ color: COLORS.textSecondary }}
              >
                Share this link:
              </p>
              <p
                className="text-sm font-mono truncate"
                style={{ color: COLORS.textPrimary }}
              >
                {generatedLink}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => copyLink(generatedLink)}
            >
              <Copy size={14} className="mr-1" />
              Copy
            </Button>
          </div>
        )}
      </Card>

      {/* Invitation List */}
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: COLORS.textPrimary }}
        >
          Sent Invitations
        </h3>

        {isLoadingInvitations ? (
          <Loading centered text="Loading invitations..." />
        ) : invitations.length === 0 ? (
          <p
            className="text-center py-8"
            style={{ color: COLORS.textSecondary }}
          >
            No invitations yet. Generate your first invite link above.
          </p>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => {
              const link = `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${inv.code}`;
              return (
                <Card key={inv.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Role badge + status */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(inv.role)}`}
                        >
                          {ROLE_DEFAULTS[inv.role].label}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            inv.is_used
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {inv.is_used ? "Accepted" : "Pending"}
                        </span>
                      </div>

                      {/* Details */}
                      <p
                        className="text-sm"
                        style={{ color: COLORS.textSecondary }}
                      >
                        {formatVideoLimit(inv.video_limit_secs)}
                        {inv.target_node && ` • For: ${inv.target_node.display_name}`}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: COLORS.textSecondary }}
                      >
                        Created {formatDate(inv.created_at)}
                      </p>
                    </div>

                    {/* Copy button for pending invites */}
                    {!inv.is_used && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyLink(link, inv.code)}
                      >
                        {copiedCode === inv.code ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
