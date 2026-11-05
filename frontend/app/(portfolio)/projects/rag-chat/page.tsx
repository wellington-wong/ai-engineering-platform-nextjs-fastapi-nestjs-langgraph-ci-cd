"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent, KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

interface ChatSession {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}

interface ChatMessage {
    id: number;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

interface DocumentInfo {
    id: number;
    name: string;
    fileType: string;
    createdAt: string;
}

// Mirrors Angular's `err.error?.message ?? fallback`
class ApiError extends Error {
    constructor(public serverMessage?: string) {
        super(serverMessage ?? "Request failed");
    }
}
const errMsg = (e: unknown, fallback: string) =>
    e instanceof ApiError && e.serverMessage ? e.serverMessage : fallback;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, init);
    if (!res.ok) {
        let message: string | undefined;
        try {
            message = (await res.json())?.message;
        } catch {}
        throw new ApiError(message);
    }
    return res.status === 204 ? (undefined as T) : res.json();
}

const json = (method: string, body: unknown): RequestInit => ({
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
});

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const markdownStyles =
    "[&_p]:mb-2 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
    "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-100 [&_pre]:p-2 " +
    "[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_a]:text-blue-600 [&_a]:underline";

export default function RagChat() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [documents, setDocuments] = useState<DocumentInfo[]>([]);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showDocPanel, setShowDocPanel] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [chatError, setChatError] = useState("");

    const messageContainer = useRef<HTMLDivElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    const activeSession = sessions.find((s) => s.id === activeId) ?? null;

    // ngOnInit
    useEffect(() => {
        // Doc panel open by default on desktop, closed on mobile
        if (!window.matchMedia("(max-width: 767px)").matches) setShowDocPanel(true);

        api<ChatSession[]>("/sessions")
            .then((s) => {
                setSessions(s);
                if (s.length > 0) setActiveId(s[0].id); // auto-select first session
            })
            .catch(() => {});
        loadDocuments();
    }, []);

    // selectSession: clear + load messages whenever the active session changes
    useEffect(() => {
        setMessages([]);
        setChatError("");
        if (activeId === null) return;
        let cancelled = false;
        api<ChatMessage[]>(`/sessions/${activeId}/messages`)
            .then((m) => !cancelled && setMessages(m))
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [activeId]);

    // ngAfterViewChecked -> scrollToBottom
    useEffect(() => {
        const el = messageContainer.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages, isSending]);

    // -- Sessions --------------------------------------------------

    function loadSessions() {
        api<ChatSession[]>("/sessions")
            .then(setSessions)
            .catch(() => {});
    }

    function selectSession(id: number) {
        setActiveId(id);
        setSidebarOpen(false);
    }

    async function newSession() {
        try {
            const s = await api<ChatSession>("/sessions", json("POST", { title: "New Chat" }));
            setSessions((prev) => [s, ...prev]);
            setActiveId(s.id);
            setSidebarOpen(false);
        } catch {}
    }

    async function deleteSession(session: ChatSession, e: React.MouseEvent) {
        e.stopPropagation();
        try {
            await api<void>(`/sessions/${session.id}`, { method: "DELETE" });
            const remaining = sessions.filter((s) => s.id !== session.id);
            setSessions(remaining);
            if (activeId === session.id) setActiveId(remaining[0]?.id ?? null);
        } catch {}
    }

    // -- Chat ------------------------------------------------------

    async function sendMessage() {
        const text = inputText.trim();
        if (!text || isSending || activeId === null) return;

        setInputText("");
        setChatError("");

        // Optimistic user message
        setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: "user", content: text, createdAt: new Date().toISOString() },
        ]);

        setIsSending(true);
        try {
            const reply = await api<ChatMessage>(`/sessions/${activeId}/chat`, json("POST", { message: text }));
            setMessages((prev) => [...prev, reply]);
            loadSessions(); // refresh session list for title update
        } catch (err) {
            setChatError(errMsg(err, "Failed to get a response. Please try again."));
        } finally {
            setIsSending(false);
        }
    }

    function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    // -- Documents -------------------------------------------------

    function loadDocuments() {
        api<DocumentInfo[]>("/documents")
            .then(setDocuments)
            .catch(() => {});
    }

    async function onFileSelected(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError("");
        setIsUploading(true);
        try {
            const form = new FormData();
            form.append("file", file);
            const doc = await api<DocumentInfo>("/documents/upload", { method: "POST", body: form });
            setDocuments((prev) => [doc, ...prev]);
        } catch (err) {
            setUploadError(errMsg(err, "Upload failed."));
        } finally {
            setIsUploading(false);
            if (fileInput.current) fileInput.current.value = "";
        }
    }

    async function deleteDocument(doc: DocumentInfo) {
        try {
            await api<void>(`/documents/${doc.id}`, { method: "DELETE" });
            setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
        } catch {}
    }

    return (
        <div className="flex h-[90dvh] bg-gray-50">
            {/* Sessions sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-white transition-transform md:static md:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="p-3">
                    <button onClick={newSession} className="w-full rounded-lg bg-blue-600 py-2 text-sm text-white">
                        + New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-3">
                    <p className="mb-1 text-xs font-semibold text-gray-500">Chats</p>
                    {sessions.length === 0 && <p className="text-xs text-gray-400">No chats yet.</p>}
                    {sessions.map((s) => (
                        <div
                            key={s.id}
                            onClick={() => selectSession(s.id)}
                            className={`flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm ${
                                s.id === activeId ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                            }`}
                        >
                            <span className="truncate">{s.title}</span>
                            <button
                                onClick={(e) => deleteSession(s, e)}
                                className="ml-2 text-gray-400 hover:text-red-500"
                                aria-label="Delete chat"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Mobile overlay (sessions or documents) */}
            {(sidebarOpen || showDocPanel) && (
                <div
                    className="fixed inset-0 z-10 bg-black/30 md:hidden"
                    onClick={() => {
                        setSidebarOpen(false);
                        setShowDocPanel(false);
                    }}
                />
            )}

            {/* Chat area */}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center gap-3 border-b bg-white px-4 py-3">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden" aria-label="Open chats">
                        ☰
                    </button>
                    <h1 className="flex-1 truncate text-lg font-semibold">{activeSession?.title ?? "RAG Chat"}</h1>
                    <button
                        onClick={() => setShowDocPanel((v) => !v)}
                        className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
                    >
                        Docs ({documents.length})
                    </button>
                </header>

                <div ref={messageContainer} className="flex-1 space-y-4 overflow-y-auto p-4">
                    {activeSession === null && (
                        <p className="mt-10 text-center text-gray-400">Create or select a chat to get started.</p>
                    )}
                    {activeSession !== null && messages.length === 0 && !isSending && (
                        <p className="mt-10 text-center text-gray-400">Ask a question about your documents.</p>
                    )}

                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm sm:max-w-[70%] ${
                                    m.role === "user" ? "bg-blue-600 text-white" : "border bg-white text-gray-800"
                                }`}
                            >
                                {m.role === "assistant" ? (
                                    <div className={`break-words ${markdownStyles}`}>
                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                                )}
                                <p className={`mt-1 text-[10px] ${m.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                                    {formatTime(m.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isSending && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl border bg-white px-4 py-2 text-sm text-gray-400">Thinking...</div>
                        </div>
                    )}
                </div>

                {chatError && <div className="bg-red-50 px-4 py-2 text-sm text-red-600">{chatError}</div>}

                <form
                    onSubmit={(e: FormEvent) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                    className="flex gap-2 border-t bg-white p-3"
                >
          <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              disabled={activeSession === null}
              placeholder={
                  activeSession === null
                      ? "Create or select a chat first..."
                      : "Type your question... (Shift+Enter for new line)"
              }
              className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
          />
                    <button
                        type="submit"
                        disabled={isSending || !inputText.trim() || activeSession === null}
                        className="self-end rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                        Send
                    </button>
                </form>
            </div>

            {/* Documents panel */}
            {showDocPanel && (
                <aside className="fixed inset-y-0 right-0 z-20 flex w-72 flex-col border-l bg-white md:static">
                    <div className="flex items-center justify-between border-b p-3">
                        <p className="text-sm font-semibold">Documents</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fileInput.current?.click()}
                                disabled={isUploading}
                                className="text-sm text-blue-600 disabled:opacity-50"
                            >
                                {isUploading ? "Uploading..." : "+ Upload"}
                            </button>
                            <button
                                onClick={() => setShowDocPanel(false)}
                                className="text-gray-400 md:hidden"
                                aria-label="Close documents"
                            >
                                ✕
                            </button>
                        </div>
                        <input ref={fileInput} type="file" onChange={onFileSelected} className="hidden" />
                    </div>

                    {uploadError && <div className="bg-red-50 px-3 py-2 text-xs text-red-600">{uploadError}</div>}

                    <div className="flex-1 overflow-y-auto p-3">
                        {documents.length === 0 && <p className="text-xs text-gray-400">No documents uploaded.</p>}
                        {documents.map((d) => (
                            <div key={d.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                                <span className="truncate">{d.name}</span>
                                <span className="shrink-0 rounded bg-gray-100 px-1.5 text-[10px] uppercase text-gray-500">
                  {d.fileType}
                </span>
                                <button
                                    onClick={() => deleteDocument(d)}
                                    className="text-gray-400 hover:text-red-500"
                                    aria-label="Delete document"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>
            )}
        </div>
    );
}