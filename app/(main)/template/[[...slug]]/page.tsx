import { redirect } from 'next/navigation';

export default function TemplatePage({ params }: { params: { slug?: string[] } }) {
  // template/ディレクトリへのアクセスを元のapp/template/へリダイレクト
  const path = params.slug ? params.slug.join('/') : '';
  
  // 元のapp/template/ディレクトリにリダイレクト
  // ここではindex.tsxなど別の実装をするのも可能
  redirect(`/template/${path}`);
}
