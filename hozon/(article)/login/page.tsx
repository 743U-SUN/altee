import { Metadata } from "next";
import LoginForm from "./components/LoginForm";
import LoginStatus from "./components/LoginStatus";

export const metadata: Metadata = {
  title: "ログイン | Altee",
  description: "Alteeにログインまたは新規登録",
};

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-center mb-6">アカウント</h1>
        <LoginStatus />
        <LoginForm />
      </div>
    </div>
  );
}
