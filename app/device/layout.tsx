import { DeviceClientLayout } from "./components";

export default function DeviceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DeviceClientLayout>
      {children}
    </DeviceClientLayout>
  );
}