import { ArticleClientLayout } from "./components";

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ArticleClientLayout>
      {children}
    </ArticleClientLayout>
  );
}