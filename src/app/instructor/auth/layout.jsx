import InstructorAuthProvider from "@/components/Instructor/InstructorAuthProvider";

export default function AuthLayout({ children }) {
    return (
        <InstructorAuthProvider>
            {children}
        </InstructorAuthProvider>
    )
}