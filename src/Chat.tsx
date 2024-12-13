import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
    role: "user" | "system";
    content: string;
}

const Chat = () => {
    const [input, setInput] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

    const sendMessage = async () => {
        if (!API_KEY) return console.error("API key is missing");

        // ユーザーのメッセージを作成し、チャットに追加
        const userMessage: ChatMessage = { role: "user", content: input };
        setChatHistory((prev) => [...prev, userMessage]);

        try {
            // サーバーにメッセージを送信
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
                { contents: [{ parts: [{ text: input }] }] },
                { headers: { "Content-Type": "application/json" } }
            );

            // サーバーからの応答を処理して、チャットに追加
            const botContent = response.data?.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join("\n") || "";
            setChatHistory((prev) => [...prev, { role: "system", content: botContent }]);
        } catch (error) {
            console.error("Error fetching response:", error);
        }

        setInput("");
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="bg-blue-600 text-white py-4 px-6 text-lg font-bold">My ChatBot</header>

            <main className="flex-grow flex flex-col items-center">
                <div className="w-4/5 flex flex-col h-full bg-white shadow rounded">
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        {chatHistory.map((msg, i) => (
                            <div
                                key={i}
                                className={`p-4 rounded-xl max-w-[70%] shadow-md text-sm ${msg.role === "user" ? "bg-blue-500 text-white self-end ml-auto" : "bg-gray-200 text-gray-800 self-start mr-auto"}`}
                            >
                                {msg.role === "system" ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t flex items-center">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 p-3 border rounded-full text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={sendMessage}
                            className="ml-3 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Chat;
