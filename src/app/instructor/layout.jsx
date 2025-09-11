import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstructorAuthProvider from "@/components/Providers/InstructorAuthProvider";


export default function InstructorLayout({ children }) {
  return (
    <InstructorAuthProvider>
      {children}
      <ToastContainer />
    </InstructorAuthProvider>
  );
}