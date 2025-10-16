import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 🔑 Dùng OpenRouter (https://openrouter.ai)
const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const ChatAI = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat", // ✅ model chuẩn trên OpenRouter
          messages: [{ role: "user", content: input }],
        }),
      });

      const data = await res.json();

      const reply =
        data?.choices?.[0]?.message?.content ||
        "Xin lỗi, tôi chưa có phản hồi từ AI 😢";

      setMessages((prev) => [...prev, { from: "ai", text: reply }]);
    } catch (err) {
      console.error("OpenRouter error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Lỗi khi gọi OpenRouter API 😢" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút mở chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setOpen(!open)}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-110 transition-all rounded-full shadow-lg w-14 h-14 flex items-center justify-center"
        >
          {open ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      {/* Hộp chat */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white shadow-2xl rounded-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 font-bold">
            Chat với MyMapFoodAI 🤖
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
            {loading && (
              <div className="text-gray-400 text-sm italic">AI đang gõ...</div>
            )}
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
};
