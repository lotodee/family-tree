import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser, getUserProfile, getTreeNode } from "@/lib/supabase/cached";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: viewedNodeId } = await params;

  // Get current user (cached - deduped with middleware)
  const { user } = await getUser();
  if (!user) redirect("/login");

  // Fetch profile and viewed node in parallel
  const [{ profile: currentProfile }, { node: viewedNode }] = await Promise.all([
    getUserProfile(user.id),
    getTreeNode(viewedNodeId),
  ]);

  if (!currentProfile) redirect("/register");
  if (!viewedNode) redirect("/tree");

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

  // Get current user's tree node for the name
  const { node: currentNode } = currentProfile.tree_node_id
    ? await getTreeNode(currentProfile.tree_node_id)
    : { node: null };

  if (isOwnProfile) {
    // Fetch answers where this user is the respondent (what they said)
    const supabase = await createClient();
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
