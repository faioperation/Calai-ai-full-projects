import { Outlet, Link } from "react-router-dom";
import Password from "../components/Password";
import InputField from "../components/Inputfield";
import Image from "../components/Image";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-t from-[#000003] to-[#060F3F] p-4">
      <div className="w-[580px] bg-linear-to-b from-[#000006] to-[#050C35] rounded-[32px] px-20 py-12 flex flex-col items-center border border-[#1E293B]/40 shadow-2xl font-montserrat">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-6 cursor-pointer">
        <Image src="/logo.png" alt="Calai" className="h-10" />
      </Link>

     

     <div className="w-full">
      <Outlet/>
     </div>
    </div>
    </div>
  );
}
