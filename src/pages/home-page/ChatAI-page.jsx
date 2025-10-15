import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const ChatAI = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");
    // Giả lập phản hồi AI (sau này thay bằng API)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Xin chào! Tôi có thể giúp gì cho bạn?" },
      ]);
    }, 500);
  };

  return (
    <>
      {/* Nút Chat cố định */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setOpen(!open)}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-110 transition-all rounded-full shadow-lg w-14 h-14 flex items-center justify-center"
        >
          {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        </Button>
      </div>

      {/* Hộp Chat */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white shadow-2xl rounded-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 font-bold">
            Chat với AI 🤖
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-80">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm max-w-[80%] ${
                  msg.from === "user"
                    ? "bg-yellow-100 self-end ml-auto"
                    : "bg-gray-100 self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} className="bg-yellow-500 text-white">
              Gửi
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
