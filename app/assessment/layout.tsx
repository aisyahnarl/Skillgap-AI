import RoleSidebar from '../components/role-sidebar';

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 lg:flex">
      <RoleSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}