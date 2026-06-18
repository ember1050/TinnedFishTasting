export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Check auth and admin role, redirect if not admin
  return (
    <div>
      <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-center text-xs text-red-700">
        ⚠️ Admin Panel — Only visible to administrators
      </div>
      {children}
    </div>
  );
}
