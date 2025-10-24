import { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const ChatAI = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 🔽 Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✨ Làm gọn nội dung trả về (xóa khoảng trắng thừa)
  const cleanText = (text) => {
    return text
      .replace(/\n{3,}/g, "\n\n") // giảm 3+ dòng trống thành 1
      .trim();
  };

  const handleSend = async (customInput) => {
    const userInput = customInput || input;
    if (!userInput.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: userInput }]);
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
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "Bạn là MyMapFoodAI – trợ lý ẩm thực thân thiện. Chỉ trả lời các câu hỏi về món ăn, quán ăn, đồ uống, ẩm thực. Nếu câu hỏi ngoài chủ đề, trả lời 'Xin lỗi, tôi chỉ hỗ trợ về ẩm thực và quán ăn 🍜'. Trình bày gợi ý món ăn thật ngắn gọn, dễ nhìn, mỗi món một dòng có emoji nếu được.",
            },
            { role: "user", content: userInput },
          ],
        }),
      });

      const data = await res.json();
      let reply =
        data?.choices?.[0]?.message?.content ||
        "Xin lỗi, tôi chưa có phản hồi từ AI 😢";

      if (reply.includes("***")) reply = "Xin lỗi, phản hồi này không hợp lệ 😅";
      reply = cleanText(reply);

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
        <div className="fixed bottom-24 right-6 w-96 bg-white shadow-2xl rounded-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 font-bold text-center">
            🍴 Chat với MyMapFoodAI 🤖
          </div>

          {/* Khung chat hiển thị markdown */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px] scrollbar-thin scrollbar-thumb-yellow-400">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                  msg.from === "user"
                    ? "bg-yellow-100 self-end ml-auto"
                    : "bg-gray-100 self-start prose prose-sm prose-yellow"
                }`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {loading && (
              <div className="text-gray-400 text-sm italic">AI đang gõ...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Gợi ý câu hỏi */}
          <div className="p-2 border-t flex flex-wrap gap-2">
            {[
              "Gợi ý món ăn mùa lạnh 🍲",
              "Tôi thích đồ cay 🌶️",
              "Quán ăn quanh Hà Nội 🍽️",
            ].map((q, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs border-yellow-400 hover:bg-yellow-100"
                onClick={() => handleSend(q)}
              >
                {q}
              </Button>
            ))}
          </div>

          {/* Ô nhập và nút gửi */}
          <div className="p-3 border-t flex gap-2 bg-gray-50">
            <Input
              placeholder="Nhập câu hỏi về món ăn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button
              onClick={() => handleSend()}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Gửi
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
