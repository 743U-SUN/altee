"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  UserCog,
  PanelsTopLeft,
  Shield,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { convertToProxyUrl } from "@/lib/utils/image-proxy"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser() {
  const { data: session, status } = useSession()
  const { isMobile } = useSidebar()
  const router = useRouter()

  // ログアウト処理
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  // Account（ダッシュボード）への遷移
  const handleAccount = () => {
    router.push("/user")
  }

  // MyPage（個別ページ）への遷移
  const handleMyPage = () => {
    if (session?.user?.handle) {
      router.push(`/${session.user.handle}`)
    }
  }

  // Admin（管理者ページ）への遷移
  const handleAdmin = () => {
    router.push("/admin")
  }

  // ログインページへの遷移
  const handleLogin = () => {
    router.push("/article/login")
  }

  // ローディング中
  if (status === "loading") {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="md:h-8 md:p-0">
            <Avatar className="h-8 w-8 rounded-lg cursor-pointer">
              <AvatarFallback className="rounded-lg">...</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // 未ログインユーザー
  if (!session?.user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="md:h-8 md:p-0 cursor-pointer"
            onClick={handleLogin}
          >
            <Avatar className="h-8 w-8 rounded-lg cursor-pointer">
              <AvatarImage src="/circleUserRound.svg" alt="ログイン" />
              <AvatarFallback className="rounded-lg">?</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">ログイン</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // ログイン済みユーザー
  const user = session.user
  const userName = user.characterName || "NoName"
  const userIcon = user.iconUrl || "/user.svg"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-lg cursor-pointer">
                <AvatarImage src={convertToProxyUrl(userIcon)} alt={userName} />
                <AvatarFallback className="rounded-lg">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium line-clamp-2">
                  {userName}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={convertToProxyUrl(userIcon)} alt={userName} />
                  <AvatarFallback className="rounded-lg">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium line-clamp-2">
                    {userName}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleMyPage} className="cursor-pointer">
                <PanelsTopLeft />
                MyPage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAccount} className="cursor-pointer">
                <UserCog />
                Account
              </DropdownMenuItem>
              {user.role === 'admin' && (
                <DropdownMenuItem onClick={handleAdmin} className="cursor-pointer">
                  <Shield />
                  Admin
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
