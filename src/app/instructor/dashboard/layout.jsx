'use client'
import { Poppins, Jost } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
const poppins = Poppins(
    {
        subsets: ["latin"],
        weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
    },
)
const jost = Jost(
    {
        subsets: ["latin"],
        weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
    },
)
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstructorAuthProvider from "@/components/Providers/InstructorAuthProvider";
import useInstructorStore from "@/store/instructorStore";
import Link from "next/link";
import { useState } from "react"; // Added for managing mobile menu state
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Menu,
    LayoutDashboard,
    BookOpen,
    Plus,
    DollarSign,
    HelpCircle,
    BarChart3,
    Megaphone,
    Award,
    Star,
    MessageSquare,
    Tag,
    User,
    LogOut,
    Bell,
    Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const menuItems = [
    {
        href: "/instructor/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        id: 1,
    },
    {
        href: "/instructor/dashboard/courses",
        icon: BookOpen,
        label: "Courses",
        id: 2,
    },
    {
        href: "/instructor/dashboard/courses/create",
        icon: Plus,
        label: "Create Course",
        id: 3,
    },
    {
        href: "/instructor/dashboard/withdrawals",
        icon: DollarSign,
        label: "Withdrawals",
        id: 4,
    },
    {
        href: "/instructor/dashboard/questions",
        icon: HelpCircle,
        label: "Questions",
        id: 5,
    },
    {
        href: "/instructor/dashboard/analytics",
        icon: BarChart3,
        label: "Analytics",
        id: 6,
    },
    {
        href: "/instructor/dashboard/announcements",
        icon: Megaphone,
        label: "Announcements",
        id: 7,
    },
    {
        href: "/instructor/dashboard/certificates",
        icon: Award,
        label: "Certificates",
        id: 8,
    },
    {
        href: "/instructor/dashboard/reviews",
        icon: Star,
        label: "Reviews",
        id: 9,
    },
    {
        href: "/instructor/dashboard/discussions",
        icon: MessageSquare,
        label: "Discussions",
        id: 10,
    },
    {
        href: "/instructor/dashboard/coupons",
        icon: Tag,
        label: "Coupons",
        id: 11,
    },
    {
        href: "/instructor/dashboard/profile",
        icon: User,
        label: "Profile",
        id: 12,
    },
];

export default function DashboardLayout({ children }) {
    const { instructor, isInstructor, logoutInstructor, isLoading } = useInstructorStore();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const isActiveRoute = (href) => pathname === href;


    const handleLogout = async () => {
        await logoutInstructor(router);
    };

    // Show loading state while authentication is in progress
    if (isLoading) {
        return (
            <InstructorAuthProvider>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading dashboard...</p>
                    </div>
                </div>
            </InstructorAuthProvider>
        );
    }

    return (
        <InstructorAuthProvider>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="lg:hidden block sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
                    <div className="flex h-16 items-center px-4 md:px-6">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-4 md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0">
                                <div className="flex h-full flex-col">
                                    {/* Logo section */}
                                    <div className="flex h-16 items-center justify-center border-b bg-indigo-500 text-white">
                                        <h2 className="text-xl font-bold">Black&Sell</h2>
                                    </div>
                                    {/* Navigation */}
                                    <nav className="flex-1 overflow-y-auto p-4">
                                        <div className="space-y-2">
                                            {menuItems.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link
                                                        key={item.id}
                                                        href={item.href}
                                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActiveRoute(item.href)
                                                            ? "bg-indigo-500 text-white shadow-glow"
                                                            : "text-foreground hover:bg-muted hover:text-primary"
                                                            }`}
                                                    >
                                                        <Icon className="h-4 w-4 flex-shrink-0" />
                                                        {item.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </nav>

                                    {/* User section */}
                                    <div className="border-t p-4">
                                        <div className="mb-3 flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={instructor?.avatar?.url || "/blacknsell.png"} />
                                                <AvatarFallback className="bg-indigo-500 text-white">
                                                    {
                                                        instructor?.fullname
                                                            ? `${instructor.fullname.firstName[0]} ${instructor.fullname.lastName[0]}`
                                                            : "BI"
                                                    }
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 text-sm">
                                                <p className="font-medium">
                                                    {instructor?.fullname 
                                                        ? `${instructor.fullname.firstName} ${instructor.fullname.lastName}`
                                                        : "Instructor"
                                                    }
                                                </p>
                                                <p className="text-muted-foreground">Instructor</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={handleLogout}
                                            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Mobile navigation trigger */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mr-4 hidden md:flex"
                            onClick={() => setIsSheetOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500"></div>
                            <h1 className="text-xl font-bold bg-indigo-500 bg-clip-text text-transparent">
                                Black&Sell
                            </h1>
                        </div>

                        {/* Search */}
                        <div className="ml-auto flex items-center gap-4">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search courses, students..."
                                    className="w-64 pl-9"
                                />
                            </div>

                            {/* Notifications */}
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                                    3
                                </Badge>
                            </Button>

                            {/* User avatar */}

                            <Avatar className="h-8 w-8">
                                <AvatarImage src={instructor?.avatar?.url || "/blacknsell.png"} />
                                <AvatarFallback className="bg-indigo-500 text-white">
                                    {
                                        instructor?.fullname
                                            ? `${instructor.fullname.firstName[0]} ${instructor.fullname.lastName[0]}`
                                            : "BlacknSell Instructor"
                                    }
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                <section className="grid flex-1 lg:grid-cols-[250px_1fr] grid-cols-1">
                    <aside className="lg:block hidden border-r bg-card">
                        <div className="flex h-full flex-col">
                            {/* Logo section */}
                            <div className="flex h-16 items-center justify-center border-b">
                                <h2 className="text-xl font-bold">Black&sell</h2>
                            </div>
                            {/* Navigation */}
                            <nav className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-2">
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.id}
                                                href={item.href}
                                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActiveRoute(item.href)
                                                    ? "bg-indigo-500 text-white shadow-glow"
                                                    : "text-foreground hover:bg-muted hover:text-primary"
                                                    }`}
                                            >
                                                <Icon className="h-4 w-4 flex-shrink-0" />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </nav>
                            {/* User section */}
                            <div className="border-t p-4">
                                <div className="mb-3 flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={instructor?.avatar?.url || "/blacknsell.png"} />
                                        <AvatarFallback className="bg-indigo-500 text-white">
                                            {
                                                instructor?.fullname
                                                    ? `${instructor.fullname.firstName[0]} ${instructor.fullname.lastName[0]}`
                                                    : "BlacknSell Instructor"
                                            }
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium text-xs">{
                                            instructor?.fullname
                                                ? `${instructor.fullname.firstName} ${instructor.fullname.lastName}`
                                                : "BlacknSell Instructor"
                                        }</p>
                                        <p className="text-muted-foreground text-[10px]">Instructor</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="">
                        {/* Search */}
                        <div className="lg:flex hidden justify-end">
                            <div className="flex items-center gap-4 p-5">
                                <div className="relative hidden md:block">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search courses, students..."
                                        className="w-64 pl-9"
                                    />
                                </div>
                                {/* Notifications */}
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                                        3
                                    </Badge>
                                </Button>
                                {/* User avatar */}
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={instructor?.avatar?.url || "/blacknsell.png"} />
                                    <AvatarFallback className="bg-indigo-500 text-white">
                                        {
                                            instructor?.fullname
                                                ? `${instructor.fullname.firstName[0]} ${instructor.fullname.lastName[0]}`
                                                : "BlacknSell Instructor"
                                        }
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                        {children}
                    </main>
                </section>


            </div>

            <footer className="bg-blue-600 text-white mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
                    <p>
                        © {new Date().getFullYear()} BlackandSell. All rights reserved.
                    </p>
                </div>
            </footer>

            <ToastContainer />
        </InstructorAuthProvider>
    );
}