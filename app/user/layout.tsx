import { UserClientLayout } from "./components";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserClientLayout>
      {children}
    </UserClientLayout>
  );
}