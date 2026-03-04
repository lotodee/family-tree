export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-gold-light)] border-t-[var(--color-gold)]" />
        <p className="mt-4 text-sm text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}
