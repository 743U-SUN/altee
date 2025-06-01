import { AdminClientLayout } from "./components";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminClientLayout>
      {children}
    </AdminClientLayout>
  );
}