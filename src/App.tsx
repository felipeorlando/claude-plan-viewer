import { useState, useMemo, useCallback } from 'react'
import { Link, Route, Switch, useLocation } from 'wouter'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { CommandMenu } from '@/components/command-menu'
import { EmptyState } from '@/components/empty-state'
import { PlanPage } from '@/pages/plan-page'
import { usePlans } from '@/hooks/use-plans'

export default function App() {
  const { files, groups, projectName, loading, error } = usePlans()
  const [searchOpen, setSearchOpen] = useState(false)
  const [location] = useLocation()

  const openSearch = useCallback(() => setSearchOpen(true), [])

  const currentTitle = useMemo(() => {
    const slug = location.replace(/^\//, '')
    if (!slug) return null
    return files.find((f) => f.slug === slug)?.title ?? null
  }, [location, files])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          groups={groups}
          projectName={projectName}
          loading={loading}
          error={error}
          onOpenSearch={openSearch}
        />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 !h-4 !self-auto" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink render={<Link href="/" />}>
                      {projectName}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {currentTitle && (
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex-1">
            <Switch>
              <Route path="/:slug">
                {(params) => <PlanPage slug={params.slug} />}
              </Route>
              <Route>
                <EmptyState />
              </Route>
            </Switch>
          </div>
        </SidebarInset>
        <CommandMenu
          files={files}
          open={searchOpen}
          onOpenChange={setSearchOpen}
        />
      </SidebarProvider>
    </TooltipProvider>
  )
}
