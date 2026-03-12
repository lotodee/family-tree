import { Loading } from "@/components/ui/loading";

export default function CelebrationLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <Loading centered text="Loading celebration..." />
    </div>
  );
}
