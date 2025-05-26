import { HandleSidebar } from "./components/HandleSidebar";
import { HandleMobileFooterNav } from "./components/HandleMobileFooterNav";
import  HandleClientLayout from "./components/HandleClientLayout";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function HandleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  
  // ユーザー情報を取得
  const user = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      name: true,
      characterName: true,
      iconUrl: true,
      handle: true,
      imageSidebars: {
        select: {
          id: true,
          url: true,
          imgUrl: true,
          alt: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });
  
  if (!user) {
    notFound();
  }
  
  return (
    <HandleClientLayout
      sidebarWidth="320px"
      sidebar={<HandleSidebar imageSidebars={user.imageSidebars} />}
      mobileFooter={<HandleMobileFooterNav />}
      user={user}
    >
      {children}
    </HandleClientLayout>
  );
}
