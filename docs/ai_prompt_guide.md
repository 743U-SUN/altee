app/(handle)/[handle]/components/HandleSidebarLayout.tsxココを見て欲しい。
app/(handle)/[handle]/page.tsxは、ユーザーの個別ページにする予定です。

Error: Dynamic href `[handle]/videos` found in <Link> while using the `/app` router, this is not supported. Read more: https://nextjs.org/docs/messages/app-dir-dynamic-href

app/(handle)/[handle]/components/HandleSidebarLayout.tsx (131:23) @ <unknown>


  129 |                       className="px-2.5 md:px-2"
  130 |                     >
> 131 |                       <Link href={item.url}>
      |                       ^
  132 |                         <item.icon />
  133 |                         <span>{item.title}</span>
  134 |                       </Link>

  このようにエラーが出てしまい、困っています。
  Dynamic hrefは<Link>では使えないということなので、どのようにして解決すればよいか教えて欲しい。