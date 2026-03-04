export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0F0A07]">
      {children}
    </div>
  );
}
