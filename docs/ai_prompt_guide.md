shadcn/uiとTailwindCSSv4を使っています。

app/(user)/components/UserSidebar.tsxの
      <SidebarContent className="flex-1 overflow-y-auto p-4">  
	  </SidebarContent>
の部分に、Collapsible SidebarMenuを作りたい。

shadcn/uiのマニュアルには以下のように書かれているが、よくわからない。

Collapsible SidebarMenu
To make a SidebarMenu component collapsible, wrap it and the SidebarMenuSub components in a Collapsible.


A collapsible sidebar menu.

<SidebarMenu>
  <Collapsible defaultOpen className="group/collapsible">
    <SidebarMenuItem>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          <SidebarMenuSubItem />
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenuItem>
  </Collapsible>
</SidebarMenu>

shadcn/uiのCollapsible SidebarMenuの作り方を調べて作ってください。
ダミーのデータオブジェクトは同じファイルに作って構いません。