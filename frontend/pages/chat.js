import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ChatBox from "../components/ChatBox";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function ChatPage() {
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("user")) router.push("/");
  }, [router]);

  return (
    <div className="h-screen w-full bg-[#030712] flex overflow-hidden">
      <Sidebar currentSessionId={currentSessionId} setCurrentSessionId={setCurrentSessionId} />
      <div className="flex-1 h-full min-w-0 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-hidden relative pb-16 md:pb-0">
          <ChatBox currentSessionId={currentSessionId} setCurrentSessionId={setCurrentSessionId} />
        </div>
        <div className="md:hidden absolute bottom-0 w-full z-50">
          <Navbar />
        </div>
      </div>
    </div>
  );
}
