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
import { useState, useEffect } from "react"; // Added useEffect for timeout
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
    Video,
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
        href: "/instructor/dashboard/live-classes",
        icon: Video,
        label: "Live Classes",
        id: 4,
    },
    {
        href: "/instructor/dashboard/withdrawals",
        icon: DollarSign,
        label: "Withdrawals",
        id: 5,
    },
    {
        href: "/instructor/dashboard/questions",
        icon: HelpCircle,
        label: "Questions",
        id: 6,
    },
    {
        href: "/instructor/dashboard/analytics",
        icon: BarChart3,
        label: "Analytics",
        id: 7,
    },
    {
        href: "/instructor/dashboard/announcements",
        icon: Megaphone,
        label: "Announcements",
        id: 8,
    },
    {
        href: "/instructor/dashboard/certificates",
        icon: Award,
        label: "Certificates",
        id: 9,
    },
    {
        href: "/instructor/dashboard/reviews",
        icon: Star,
        label: "Reviews",
        id: 10,
    },
    {
        href: "/instructor/dashboard/discussions",
        icon: MessageSquare,
        label: "Discussions",
        id: 11,
    },
    // {
    //     href: "/instructor/dashboard/coupons",
    //     icon: Tag,
    //     label: "Coupons",
    //     id: 12,
    // },
    {
        href: "/instructor/dashboard/profile",
        icon: User,
        label: "Profile",
        id: 13,
    },
];

export default function DashboardLayout({ children }) {
    const { instructor, isInstructor, logoutInstructor, isLoading } = useInstructorStore();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [forceShow, setForceShow] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const isActiveRoute = (href) => pathname === href;

    const handleLogout = async () => {
        await logoutInstructor(router);
    };

    // Debug logging
    // console.log("DashboardLayout render:", {
    //     hasInstructor: !!instructor,
    //     isInstructor,
    //     isLoading,
    //     instructorId: instructor?._id,
    //     instructorEmail: instructor?.email,
    //     forceShow,
    //     hasToken: typeof window !== 'undefined' && !!localStorage.getItem('instructor_token'),
    //     inconsistentState: isInstructor && !instructor
    // });

    // Force show dashboard after 15 seconds to prevent infinite loading
    useEffect(() => {
        const timer = setTimeout(() => {
            console.warn("Force showing dashboard after timeout");
            setForceShow(true);
        }, 15000);

        return () => clearTimeout(timer);
    }, []);

    // Handle redirect to login if no token (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasToken = localStorage.getItem('instructor_token') || document.cookie.includes('instructor_token');
            console.log("Token check:", { hasToken, instructor: !!instructor, forceShow });
            
            // Handle inconsistent state: isInstructor true but no instructor data
            if (isInstructor && !instructor && hasToken) {
                console.log("Inconsistent state detected: isInstructor true but no instructor data");
                // Try to reload instructor data
                const { loadInstructor } = useInstructorStore.getState();
                loadInstructor();
                return;
            }
            
            if (!hasToken && !instructor && !forceShow) {
                console.log("No instructor token found, redirecting to login");
                // Use window.location for more reliable redirect
                window.location.href = '/instructor/auth/login';
            }
        }
    }, [instructor, forceShow, isInstructor]);

    // Show loading state only if we don't have instructor data yet and not forcing show
    // Don't get stuck in loading if we have instructor but isLoading is true
    if (!instructor && isLoading && !forceShow) {
        return (
            <InstructorAuthProvider>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading dashboard...</p>
                        <p className="text-xs text-muted-foreground mt-2">If this takes too long, please refresh the page</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </InstructorAuthProvider>
        );
    }

    // If we don't have instructor data and not forcing show, show loading with manual auth check
    // Also handle inconsistent state where isInstructor is true but instructor is null
    if ((!instructor || (isInstructor && !instructor)) && !forceShow) {
        // Check if we have a token on client side
        const hasToken = typeof window !== 'undefined' && 
            (localStorage.getItem('instructor_token') || document.cookie.includes('instructor_token'));
        
        // If no token, show a simple redirect message
        if (!hasToken) {
            // Immediate redirect attempt
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    window.location.href = '/instructor/auth/login';
                }
            }, 1000);
            
            return (
                <InstructorAuthProvider>
                    <div className="min-h-screen bg-background flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Redirecting to login...</p>
                            <p className="text-xs text-muted-foreground mt-2">Please wait while we redirect you</p>
                            <button 
                                onClick={() => window.location.href = '/instructor/auth/login'} 
                                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                            >
                                Go to Login Now
                            </button>
                        </div>
                    </div>
                </InstructorAuthProvider>
            );
        }
        
        // Has token but no instructor data, show loading with manual auth check
        return (
            <InstructorAuthProvider>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Authenticating...</p>
                        <p className="text-xs text-muted-foreground mt-2">If this takes too long, please try the options below</p>
                        <div className="mt-4 space-y-2">
                            <button 
                                onClick={() => window.location.reload()} 
                                className="block w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                            >
                                Refresh Page
                            </button>
                            <button 
                                onClick={() => window.location.href = '/instructor/auth/login'} 
                                className="block w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Go to Login
                            </button>
                            <button 
                                onClick={async () => {
                                    console.log("Manual auth check triggered");
                                    const { loadInstructor } = useInstructorStore.getState();
                                    const result = await loadInstructor();
                                    console.log("Manual auth result:", result);
                                    if (result.success) {
                                        window.location.reload();
                                    }
                                }} 
                                className="block w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Check Auth
                            </button>
                        </div>
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