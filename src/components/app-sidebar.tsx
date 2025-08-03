import {
    LayoutDashboard,
    TableOfContents,
    NotebookPen,
    FilePlus2,
    SquarePen,

} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Chapters",
        url: "/dashboard/chapters",
        icon: TableOfContents,
    },
    {
        title: "Topics",
        url: "/dashboard/topics",
        icon: NotebookPen,
    },
    {
        title: "Add",
        url: "/dashboard/add",
        icon: FilePlus2,
    },
    {
        title: "Edit",
        url: "/dashboard/edit",
        icon: SquarePen,
    },
]

export function AppSidebar() {
    return (
        <Sidebar variant="floating">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-3xl text-stone-900 dark:text-white">JEE PROGRESS</SidebarGroupLabel>
                    <SidebarGroupContent className="p-5">
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem className="my-2" key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link className="border border-black bg-stone-200 dark:border-white dark:bg-stone-950" href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}