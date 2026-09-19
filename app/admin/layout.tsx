import RoleSidebar from '../components/role-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 lg:flex">
      <RoleSidebar fixedRole="Admin" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}