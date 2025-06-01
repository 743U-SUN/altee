import { HomeClientLayout } from "./components";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HomeClientLayout>
      {children}
    </HomeClientLayout>
  );
}
