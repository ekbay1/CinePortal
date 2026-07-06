"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type ChatbotResponse = {
  reply: string;
  category: string;
  escalated: boolean;
  ticket_id: number | null;
  suggested_actions: string[];
};

type ChatMessage = {
  sender: "user" | "bot";
  text: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function SupportPage() {
  const [input, setInput] = useState("");
  const { token, isLoading, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Hi, I’m the CinePortal support bot. Ask me about billing, subscriptions, playback, password help, or add-ons.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return;
    }

    if (!token) {
    setError("You must be logged in to use support.");
    return;
    }

    setMessages((current) => [
      ...current,
      {
        sender: "user",
        text: trimmedInput,
      },
    ]);

    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmedInput,
          create_ticket_if_unresolved: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send chatbot message.");
      }

      const data = (await response.json()) as ChatbotResponse;

      const ticketText = data.escalated
        ? ` Ticket #${data.ticket_id} was created.`
        : "";

      setMessages((current) => [
        ...current,
        {
          sender: "bot",
          text: `${data.reply}${ticketText}`,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl">
        <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
          CinePortal
        </p>

        <h1 className="text-4xl font-bold">Customer Support Chatbot</h1>

        <p className="mt-3 text-neutral-400">
          Ask about billing, subscriptions, add-ons, playback issues, or account access.
        </p>

        <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="mb-4 flex max-h-96 flex-col gap-3 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={`${message.sender}-${index}`}
                className={
                  message.sender === "user"
                    ? "self-end rounded-lg bg-white px-4 py-2 text-black"
                    : "self-start rounded-lg bg-neutral-800 px-4 py-2 text-white"
                }
              >
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your support question..."
              className="flex-1 rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-white"
            />

            <button
              type="submit"
              disabled={isSending}
              className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>

        {error && <p className="mt-4 text-red-500">{error}</p>}
      </section>
    </main>
  );
}