import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, ListTodo, Settings, User2 } from "lucide-react";

const appItems = [
    { title: "Dashboard", url: "#", icon: LayoutDashboard },
    { title: "Projects", url: "#", icon: ListTodo },
    { title: "Users", url: "#", icon: User2 },
    { title: "Settings", url: "#", icon: Settings },
];

export default function WorkspaceMenuSidebar() {
    return (
        <Sidebar className="border-r bg-white/80 backdrop-blur w-[15rem] h-full">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sm font-medium opacity-70">Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {appItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="flex items-center gap-3 py-2 rounded-md hover:bg-accent">
                                            <item.icon className="h-5 w-5 opacity-80" />
                                            <span>{item.title}</span>
                                        </a>
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
