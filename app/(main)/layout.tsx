import ClientLayout from "@/components/layouts/ClientLayout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
