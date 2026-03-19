import * as React from 'react'
import { Link, useLocation } from 'wouter'
import { ChevronRightIcon, SearchIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import type { DayGroup } from '@/hooks/use-plans'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  groups: DayGroup[]
  projectName: string
  loading: boolean
  error: string | null
  onOpenSearch: () => void
}

export function AppSidebar({
  groups,
  projectName,
  loading,
  error,
  onOpenSearch,
  ...props
}: AppSidebarProps) {
  const [location] = useLocation()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<span />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <img src="/logo.svg" alt="Logo" className="size-8" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">{projectName}</span>
                <span className="text-xs text-muted-foreground">
                  {groups.reduce((acc, g) => acc + g.files.length, 0)} documents
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onOpenSearch}
              className="text-muted-foreground"
            >
              <SearchIcon className="size-4" />
              <span>Search</span>
              <kbd className="ml-auto pointer-events-none text-[10px] font-mono text-muted-foreground/60">
                <span className="text-[11px]">&#8984;</span>K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {loading ? (
          <SidebarGroup>
            <SidebarMenu>
              {Array.from({ length: 6 }).map((_, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : error ? (
          <SidebarGroup>
            <p className="px-2 pt-4 text-xs text-destructive">{error}</p>
          </SidebarGroup>
        ) : groups.length === 0 ? (
          <SidebarGroup>
            <p className="px-2 pt-4 text-xs text-muted-foreground">
              No plan files found
            </p>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarMenu>
              {groups.map((group) => (
                <Collapsible
                  key={group.date ?? 'undated'}
                  defaultOpen
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="font-medium">
                        {group.label}
                        <ChevronRightIcon className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {group.files.length > 0 && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.files.map((file) => (
                            <SidebarMenuSubItem key={file.slug}>
                              <SidebarMenuSubButton
                                className="h-auto min-h-7 py-1"
                                isActive={location === `/${file.slug}`}
                                render={<Link href={`/${file.slug}`} />}
                              >
                                {file.title}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
