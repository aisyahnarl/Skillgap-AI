import RoleSidebar from '../components/role-sidebar';

export default function CounselorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <RoleSidebar fixedRole="Guru BK" />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
