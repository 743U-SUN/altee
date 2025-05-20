import ClientLayout from "@/components/layouts/ClientLayout";
import { LayoutProvider } from "@/contexts/layout-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutProvider>
      <ClientLayout>{children}</ClientLayout>
    </LayoutProvider>
  );
}
