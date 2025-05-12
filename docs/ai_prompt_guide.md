http://localhost:3000/sample/mainLayoutにChromeでアクセスするとまれに以下のようなエラーが出る。
Error: A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <HotReload assetPrefix="" globalError={[...]}>
      <AppDevOverlay state={{nextId:1, ...}} globalError={[...]}>
        <AppDevOverlayErrorBoundary globalError={[...]} onError={function bound dispatchSetState}>
          <ReplaySsrOnlyErrors>
          <DevRootHTTPAccessFallbackBoundary>
            <HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>
              <HTTPAccessFallbackErrorBoundary pathname="/sample/ma..." notFound={<NotAllowedRootHTTPFallbackError>} ...>
                <RedirectBoundary>
                  <RedirectErrorBoundary router={{...}}>
                    <Head>
                    <link>
                    <script>
                    <RootLayout>
                      <html lang="en">
                        <body
+                         className="geist_e531dabc-module__QGiZLq__variable geist_mono_68a01160-module__YLcDdW__variable"
-                         className="geist_e531dabc-module__QGiZLq__variable geist_mono_68a01160-module__YLcDdW__varia..."
                        >
                    ...
        ...

    at createUnhandledError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_fdf37019._.js:879:71)
    at handleClientError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_fdf37019._.js:1052:56)
    at console.error (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_fdf37019._.js:1191:56)
    at http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:9382:25
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:3501:74)
    at emitPendingHydrationWarnings (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:9381:13)
    at completeWork (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:9455:102)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:3501:131)
    at completeUnitOfWork (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:10233:23)
    at performUnitOfWork (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:10170:28)
    at workLoopConcurrentByScheduler (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:10164:58)
    at renderRootConcurrent (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:10146:71)
    at performWorkOnRoot (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:9784:176)
    at performWorkOnRootViaSchedulerTask (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:10796:9)
    at MessagePort.performWorkUntilDeadline (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:1952:64)
    at body (<anonymous>)
    at RootLayout (rsc://React/Server/file:///app/.next/server/chunks/ssr/%5Broot%20of%20the%20server%5D__012ba519._.js?0:88:270)

    しかし、Edgeでアクセスすると何度アクセスしてもエラーは出ない。
    ここに書いてあるとおり、エクステンションが悪さをしているっぽい。
    
    無視して良いエラーかな？

    おそらくhttps://github.com/igrigorik/videospeedが原因だと思う。

    1. 同じようなことになっている人が居ないか調べる。もちろん海外サイトも。
    2. 解決策を考える。
    
    ファイルの編集はしないで、どのようにすれば解決できるのか調べてください。また、無視して良いものなのかどうかも教えて下さい。