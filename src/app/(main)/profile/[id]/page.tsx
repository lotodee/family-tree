import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: viewedNodeId } = await params;

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get current user's profile
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!currentProfile) redirect("/register");

  // Get the viewed profile's tree node
  const { data: viewedNode } = await supabase
    .from("family_tree_nodes")
    .select("*")
    .eq("id", viewedNodeId)
    .single();

  if (!viewedNode) {
    redirect("/tree");
  }

  // Check if viewing own profile
  const isOwnProfile = currentProfile.tree_node_id === viewedNodeId;

  // If viewing own profile, fetch what THEY said (not what others said about them)
  let answersAboutSelf: Array<{
    id: string;
    answer_text: string | null;
    question_id: string;
    subject_id: string;
    question: { text: string; category: string };
    subject?: { display_name: string };
  }> = [];

  let answersAboutOthers: Array<{
    id: string;
    answer_text: string | null;
    question_id: string;
    subject_id: string;
    question: { text: string; category: string };
    subject?: { display_name: string };
  }> = [];

  if (isOwnProfile) {
    // Fetch answers where this user is the respondent (what they said)
    const { data: userAnswers } = await supabase
      .from("answers")
      .select(`
        id,
        answer_text,
        question_id,
        subject_id,
        questions!inner (
          text,
          category
        ),
        family_tree_nodes!answers_subject_id_fkey (
          display_name
        )
      `)
      .eq("respondent_id", user.id)
      .eq("is_confirmed", true);

    if (userAnswers) {
      // Split into about self vs about others
      userAnswers.forEach((answer) => {
        // Handle Supabase nested relations which can be object or array
        const questionData = answer.questions as unknown as { text: string; category: string };
        const subjectData = answer.family_tree_nodes as unknown as { display_name: string } | null;

        const formatted = {
          id: answer.id,
          answer_text: answer.answer_text,
          question_id: answer.question_id,
          subject_id: answer.subject_id,
          question: {
            text: questionData.text,
            category: questionData.category,
          },
          subject: subjectData
            ? { display_name: subjectData.display_name }
            : undefined,
        };

        if (answer.subject_id === viewedNodeId) {
          answersAboutSelf.push(formatted);
        } else {
          answersAboutOthers.push(formatted);
        }
      });
    }
  }

  // Get current user's name for the trick message
  const { data: currentNode } = await supabase
    .from("family_tree_nodes")
    .select("display_name")
    .eq("id", currentProfile.tree_node_id)
    .single();

  const currentUserName = currentNode?.display_name || currentProfile.full_name;

  return (
    <ProfileClient
      viewedNode={viewedNode}
      isOwnProfile={isOwnProfile}
      currentUserName={currentUserName}
      answersAboutSelf={answersAboutSelf}
      answersAboutOthers={answersAboutOthers}
    />
  );
}
