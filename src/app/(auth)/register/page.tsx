"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Check, Copy, Loader2, ChevronLeft } from "lucide-react";
import { z } from "zod";
import type { FamilyTreeNode } from "@/types";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  age: z.number().min(1, "Please enter your age").max(120, "Please enter a valid age"),
});

type Step = 1 | 2 | 3;

interface ManualFormData {
  fullName: string;
  relationshipType: "child" | "grandchild" | "spouse";
  fatherName: string;
  motherName: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [step, setStep] = useState<Step>(1);
  const [nodes, setNodes] = useState<FamilyTreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<FamilyTreeNode | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState<ManualFormData>({
    fullName: "",
    relationshipType: "grandchild",
    fatherName: "",
    motherName: "",
  });
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [emailError, setEmailError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNodes, setIsLoadingNodes] = useState(true);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch unclaimed nodes on mount
  useEffect(() => {
    async function fetchNodes() {
      const { data, error } = await supabase
        .from("family_tree_nodes")
        .select("*")
        .eq("is_claimed", false)
        .order("generation", { ascending: true })
        .order("branch", { ascending: true })
        .order("display_name", { ascending: true });

      if (error) {
        console.error("Error fetching nodes:", error);
        toast.error("Failed to load family members. Please refresh.");
      } else {
        setNodes(data || []);
      }
      setIsLoadingNodes(false);
    }

    fetchNodes();
  }, [supabase]);

  // Group nodes by category
  const groupedNodes = {
    michaelsChildren: nodes.filter(
      (n) => n.generation === 1 && n.node_type === "biological"
    ),
    spouses: nodes.filter(
      (n) => n.generation === 1 && n.node_type === "spouse"
    ),
    grandchildrenByBranch: nodes
      .filter((n) => n.generation === 2)
      .reduce(
        (acc, node) => {
          const branch = node.branch || "other";
          if (!acc[branch]) acc[branch] = [];
          acc[branch].push(node);
          return acc;
        },
        {} as Record<string, FamilyTreeNode[]>
      ),
  };

  // Handle node selection
  const handleSelectNode = (node: FamilyTreeNode) => {
    setSelectedNode(node);
    setShowManualForm(false);
  };

  // Handle step 1 next
  const handleStep1Next = () => {
    if (selectedNode || (showManualForm && manualForm.fullName.trim())) {
      setStep(2);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    // Validate email and age
    const ageNum = typeof age === "number" ? age : parseInt(String(age), 10);
    const result = formSchema.safeParse({ email, age: ageNum });
    if (!result.success) {
      const errors = result.error.issues;
      const emailErr = errors.find((e) => e.path[0] === "email");
      const ageErr = errors.find((e) => e.path[0] === "age");
      if (emailErr) setEmailError(emailErr.message);
      if (ageErr) setAgeError(ageErr.message);
      return;
    }
    setEmailError("");
    setAgeError("");
    setIsLoading(true);

    try {
      const payload = selectedNode
        ? { nodeId: selectedNode.id, email, age: ageNum }
        : {
            nodeId: null,
            email,
            age: ageNum,
            fullName: manualForm.fullName,
            relationshipType: manualForm.relationshipType,
            fatherName: manualForm.fatherName || null,
            motherName: manualForm.motherName || null,
          };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          if (data.error?.includes("email")) {
            toast.error(
              <div>
                {data.error}{" "}
                <Link href="/login" className="underline">
                  Log in here
                </Link>
              </div>
            );
          } else {
            toast.error(
              "This name was just claimed by someone else. Please refresh and try again."
            );
          }
        } else {
          toast.error(data.error || "Registration failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Success!
      setPassword(data.password);
      setFullName(data.fullName);

      // Auto-login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      });

      if (signInError) {
        console.error("Auto-login failed:", signInError);
        toast.error("Account created! Please log in manually with your password.");
      }

      setStep(3);
    } catch {
      toast.error("Something went wrong. Check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy password
  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("Password copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please copy manually.");
    }
  };

  // Get generation label
  const getGenerationLabel = (node: FamilyTreeNode) => {
    if (node.generation === 0) return "Patriarch/Matriarch";
    if (node.generation === 1) {
      return node.node_type === "spouse" ? "Spouse" : "Child of Grandpa";
    }
    return "Grandchild";
  };

  // Format branch name
  const formatBranchName = (branch: string) => {
    return branch.charAt(0).toUpperCase() + branch.slice(1) + "'s Family";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Step 1: Find Your Name */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--color-burgundy)]">
              Find Your Name
            </h1>
            <p className="mb-8 font-[family-name:var(--font-dm-sans)] text-[var(--color-text-secondary)]">
              Tap your name below to claim your spot on the family tree.
            </p>

            {isLoadingNodes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-gold)]" />
              </div>
            ) : nodes.length === 0 && !showManualForm ? (
              <div className="rounded-lg bg-[var(--color-ivory)] p-6 text-center">
                <p className="mb-4 text-[var(--color-text-secondary)]">
                  Everyone on the list has joined! If you&apos;re not seeing your
                  name, use the form below.
                </p>
                <button
                  onClick={() => setShowManualForm(true)}
                  className="font-medium text-[var(--color-burgundy)] underline"
                >
                  I&apos;m not on the list
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Michael's Children */}
                {groupedNodes.michaelsChildren.length > 0 && (
                  <div>
                    <h2 className="mb-3 font-[family-name:var(--font-playfair)] text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Michael&apos;s Children
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {groupedNodes.michaelsChildren.map((node) => (
                        <NodeCard
                          key={node.id}
                          node={node}
                          isSelected={selectedNode?.id === node.id}
                          onSelect={handleSelectNode}
                          label={getGenerationLabel(node)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Spouses */}
                {groupedNodes.spouses.length > 0 && (
                  <div>
                    <h2 className="mb-3 font-[family-name:var(--font-playfair)] text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Spouses
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {groupedNodes.spouses.map((node) => (
                        <NodeCard
                          key={node.id}
                          node={node}
                          isSelected={selectedNode?.id === node.id}
                          onSelect={handleSelectNode}
                          label={getGenerationLabel(node)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Grandchildren by Branch */}
                {Object.entries(groupedNodes.grandchildrenByBranch).map(
                  ([branch, branchNodes]) => (
                    <div key={branch}>
                      <h2 className="mb-3 font-[family-name:var(--font-playfair)] text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                        {formatBranchName(branch)}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {branchNodes.map((node) => (
                          <NodeCard
                            key={node.id}
                            node={node}
                            isSelected={selectedNode?.id === node.id}
                            onSelect={handleSelectNode}
                            label={getGenerationLabel(node)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* I'm not on the list */}
                {!showManualForm && (
                  <button
                    onClick={() => {
                      setShowManualForm(true);
                      setSelectedNode(null);
                    }}
                    className="mt-4 font-[family-name:var(--font-dm-sans)] text-sm font-medium text-[var(--color-burgundy)] underline underline-offset-2"
                  >
                    I&apos;m not on the list
                  </button>
                )}

                {/* Manual Form */}
                {showManualForm && (
                  <div className="mt-6 rounded-lg border border-[var(--color-gold-light)] bg-[var(--color-ivory)] p-4">
                    <h3 className="mb-4 font-[family-name:var(--font-playfair)] text-lg font-semibold text-[var(--color-text-primary)]">
                      Tell us about yourself
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          value={manualForm.fullName}
                          onChange={(e) =>
                            setManualForm({ ...manualForm, fullName: e.target.value })
                          }
                          className="w-full rounded-lg border border-[var(--color-gold-light)] bg-white px-4 py-3 text-[var(--color-text-primary)] focus:border-[var(--color-gold)] focus:outline-none"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                          Your Relationship
                        </label>
                        <select
                          value={manualForm.relationshipType}
                          onChange={(e) =>
                            setManualForm({
                              ...manualForm,
                              relationshipType: e.target.value as ManualFormData["relationshipType"],
                            })
                          }
                          className="w-full rounded-lg border border-[var(--color-gold-light)] bg-white px-4 py-3 text-[var(--color-text-primary)] focus:border-[var(--color-gold)] focus:outline-none"
                        >
                          <option value="grandchild">Grandchild</option>
                          <option value="child">Child of Grandpa</option>
                          <option value="spouse">Spouse</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                          Father&apos;s Name
                        </label>
                        <input
                          type="text"
                          value={manualForm.fatherName}
                          onChange={(e) =>
                            setManualForm({ ...manualForm, fatherName: e.target.value })
                          }
                          className="w-full rounded-lg border border-[var(--color-gold-light)] bg-white px-4 py-3 text-[var(--color-text-primary)] focus:border-[var(--color-gold)] focus:outline-none"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
                          Mother&apos;s Name
                        </label>
                        <input
                          type="text"
                          value={manualForm.motherName}
                          onChange={(e) =>
                            setManualForm({ ...manualForm, motherName: e.target.value })
                          }
                          className="w-full rounded-lg border border-[var(--color-gold-light)] bg-white px-4 py-3 text-[var(--color-text-primary)] focus:border-[var(--color-gold)] focus:outline-none"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setShowManualForm(false)}
                      className="mt-4 text-sm text-[var(--color-text-secondary)] underline"
                    >
                      Back to the list
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={handleStep1Next}
              disabled={
                !selectedNode && !(showManualForm && manualForm.fullName.trim())
              }
              className="mt-8 w-full rounded-full bg-[var(--color-gold)] py-4 font-[family-name:var(--font-dm-sans)] text-lg font-semibold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>

            <p className="mt-6 text-center font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)]">
              Already joined?{" "}
              <Link
                href="/login"
                className="font-medium text-[var(--color-burgundy)] underline"
              >
                Log in here
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: Enter Email */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setStep(1)}
              className="mb-6 flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-burgundy)]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--color-burgundy)]">
              Welcome, {selectedNode?.display_name || manualForm.fullName}!
            </h1>
            <p className="mb-8 font-[family-name:var(--font-dm-sans)] text-[var(--color-text-secondary)]">
              Enter your details to complete registration.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-[family-name:var(--font-dm-sans)] text-sm font-medium text-[var(--color-text-secondary)]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  autoFocus
                  autoComplete="email"
                  className="w-full rounded-lg border border-[var(--color-gold-light)] bg-white px-4 py-4 text-lg text-[var(--color-text-primary)] focus:border-[var(--color-gold)] focus:outline-none"
                  placeholder="you@example.com"
                />
                {emailError && (
                  <p className="mt-2 text-sm text-[var(--color-error)]">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block font-[family-name:var(--font-dm-sans)] text-sm font-medium text-[var(--color-text-secondary)]">
                  Your Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAge(val === "" ? "" : parseInt(val, 10));
                    setAgeError("");
                  }}
                  min={1}
                  max={120}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-[var(--color-gold-light)] bg-white px-4 py-4 text-lg text-[var(--color-text-primary)] focus:border-[var(--color-gold)] focus:outline-none"
                  placeholder="Enter your age"
                />
                {ageError && (
                  <p className="mt-2 text-sm text-[var(--color-error)]">
                    {ageError}
                  </p>
                )}
              </div>

              <button
                onClick={handleRegister}
                disabled={isLoading || !email || !age}
                className="w-full rounded-full bg-[var(--color-gold)] py-4 font-[family-name:var(--font-dm-sans)] text-lg font-semibold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating your account...
                  </span>
                ) : (
                  "Create My Account"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Password Reveal */}
        {step === 3 && (
          <div className="animate-fade-in-up text-center">
            <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--color-burgundy)]">
              Welcome to the family, {fullName}!
            </h1>
            <p className="mb-8 font-[family-name:var(--font-dm-sans)] text-[var(--color-text-secondary)]">
              Here is your login password. Save it somewhere safe.
            </p>

            {/* Password Box */}
            <div className="mb-6 rounded-lg border-2 border-[var(--color-gold)] bg-[var(--color-ivory)] p-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                Your login password
              </p>
              <div className="flex items-center justify-center gap-3">
                <p className="font-mono text-2xl font-bold tracking-wider text-[var(--color-text-primary)]">
                  {password}
                </p>
                <button
                  onClick={handleCopyPassword}
                  className="rounded-lg bg-[var(--color-gold-light)] p-2 transition-colors hover:bg-[var(--color-gold)]"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-[var(--color-success)]" />
                  ) : (
                    <Copy className="h-5 w-5 text-[var(--color-text-primary)]" />
                  )}
                </button>
              </div>
            </div>

            <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
              We&apos;ve also emailed this to you. Save it somewhere safe — you&apos;ll
              need it to log back in.
            </p>
            <p className="mb-4 rounded-lg bg-[var(--color-gold-light)] bg-opacity-30 p-3 text-xs text-[var(--color-text-secondary)]">
              This is your only chance to see this password on screen. Make sure
              you&apos;ve saved it before continuing.
            </p>
            <p className="mb-8 text-xs text-[var(--color-text-secondary)]">
              You can change your password anytime in Settings after logging in.
            </p>

            <button
              onClick={() => router.push("/questions")}
              className="w-full rounded-full bg-[var(--color-gold)] py-4 font-[family-name:var(--font-dm-sans)] text-lg font-semibold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-gold-light)]"
            >
              Continue to Your Questions &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Node Card Component
function NodeCard({
  node,
  isSelected,
  onSelect,
  label,
}: {
  node: FamilyTreeNode;
  isSelected: boolean;
  onSelect: (node: FamilyTreeNode) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onSelect(node)}
      className={`relative flex min-h-[60px] min-w-[120px] flex-col items-center justify-center rounded-lg border-2 px-4 py-3 transition-all ${
        isSelected
          ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-text-primary)]"
          : "border-[var(--color-gold-light)] bg-[var(--color-ivory)] text-[var(--color-text-primary)] hover:border-[var(--color-gold)]"
      }`}
    >
      {isSelected && (
        <Check className="absolute right-1 top-1 h-4 w-4 text-[var(--color-text-primary)]" />
      )}
      <span className="font-[family-name:var(--font-dm-sans)] font-semibold">
        {node.display_name}
      </span>
      <span className="text-xs opacity-70">{label}</span>
    </button>
  );
}
