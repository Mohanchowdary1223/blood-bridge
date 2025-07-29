"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea" // Changed from Input to Textarea
import {
  ArrowLeft,
  Plus,
  Send,
  Bot,
  User,
  Trash2,
  History,
  MoreVertical,
  MessageCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatSession {
  _id?: string
  title: string
  messages: Message[]
  createdAt: Date
}


// Get userId from localStorage (client-side only)
function getUserIdFromLocalStorage(): string | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || user._id || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

const HealthcareChatBotContent: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null);
  const { open, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar()
  const router = useRouter()
  
  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null) // Added for textarea auto-resize

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Scroll to bottom when currentChat messages change
  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  // On mount, get userId and fetch chat history
  useEffect(() => {
    const id = getUserIdFromLocalStorage();
    setUserId(id);
    if (!id) {
      setChatHistory([]);
      setCurrentChat(null);
      return;
    }
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/healthaibot", {
          headers: { "x-user-id": id },
        });
        const data = await res.json();
        setChatHistory(data.history || []);
        setCurrentChat(null);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setCurrentChat(null);
      }
    };
    fetchHistory();
  }, []);

  // Send message to backend
  const sendMessage = async () => {
    if (!inputMessage.trim() || !userId) return;
    setLoading(true);
    try {
      const chatId = currentChat?._id;
      const title = currentChat?.title || inputMessage.slice(0, 30) + (inputMessage.length > 30 ? "…" : "");
      const res = await fetch("/api/healthaibot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ chatId, message: inputMessage, title }),
      });
      const data = await res.json();
      setInputMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (chatId) {
        setChatHistory((prev) => prev.map((c) => (c._id === chatId ? data.chat : c)));
        setCurrentChat(data.chat);
      } else {
        setChatHistory((prev) => [data.chat, ...prev]);
        setCurrentChat(data.chat);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete chat from backend
  const deleteChat = async (id: string) => {
    if (!userId) return;
    try {
      await fetch(`/api/healthaibot?id=${id}`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
      });
      setChatHistory((prev) => prev.filter((c) => c._id !== id));
      if (currentChat && currentChat._id === id) {
        const remaining = chatHistory.filter((c) => c._id !== id);
        setCurrentChat(remaining[0] ?? null);
      }
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  // Helper function to close sidebar
  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    } else {
      setOpen(false)
    }
  }

  // New Chat handler with sidebar close
  const handleNewChat = () => {
    setCurrentChat(null)
    closeSidebar()
  }

  // Continue Chat handler with sidebar close
  const handleContinueChat = (chat: ChatSession) => {
    setCurrentChat(chat)
    closeSidebar()
  }

  // Handle history click - opens sidebar and shows chat history
  const handleHistoryClick = () => {
    if (!open && !isMobile) {
      setOpen(true)
    } else if (!openMobile && isMobile) {
      setOpenMobile(true)
    }
  }

  // Handle back/home button click - navigate to home
  const handleBackToHome = () => {
    router.push("/home")
  }

  // Auto-resize textarea function
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* success toast */}
        {showDeleteSuccess && (
          <div className="fixed top-20 right-4 z-[60] rounded-md bg-green-500 px-4 py-2 text-white shadow-lg">
            Chat deleted successfully!
          </div>
        )}

        {/* mobile sidebar trigger (below navbar) */}
        {isMobile && !openMobile && (
          <div className="fixed top-20 left-4 z-[60]">
            <SidebarTrigger className="h-10 w-10 cursor-pointer border bg-background shadow-md" />
          </div>
        )}

        {/* sidebar */}
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible="icon"
          className="fixed left-0 top-16 bottom-0 z-50 w-[280px] border-r bg-background"
        >
          <SidebarHeader className="border-b">
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex w-full items-center justify-center p-2">
                  <SidebarTrigger className="h-8 w-8 cursor-pointer" />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-hidden">
            <SidebarMenu className="px-2">
              {/* Back Button with Tooltip - Navigate to /home */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      onClick={handleBackToHome}
                      className="w-full cursor-pointer"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Home</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {!open && !isMobile && (
                    <TooltipContent side="right">
                      <p>Home</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>

              {/* New Chat Button with Tooltip */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      onClick={handleNewChat}
                      className="w-full cursor-pointer"
                    >
                      <Plus className="size-4" />
                      <span>New Chat</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {!open && !isMobile && (
                    <TooltipContent side="right">
                      <p>New Chat</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>

              {/* History Header with Tooltip - Clickable when collapsed */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton 
                      className={`w-full ${!open && !isMobile ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={!open && !isMobile ? handleHistoryClick : undefined}
                      disabled={open || isMobile}
                    >
                      <History className="size-4" />
                      <span>Recent Chats</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {!open && !isMobile && (
                    <TooltipContent side="right">
                      <p>Chat History</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* Chat History List - Only show when sidebar is open */}
            {(isMobile ? openMobile : open) && (
              <div className="flex-1 overflow-y-auto px-2 pb-20">
                <SidebarMenu>
                  {chatHistory.map((chat) => (
                    <SidebarMenuItem key={chat._id}>
                      <div className="group flex w-full items-center">
                        {/* chat title press */}
                        <SidebarMenuButton
                          onClick={() => handleContinueChat(chat)}
                          className="flex-1 min-h-[44px] justify-start pr-2 cursor-pointer"
                        >
                          <div className="flex w-full min-w-0 flex-col items-start">
                            <span className="truncate text-sm font-medium">
                              {chat.title}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {chat.messages?.length || 0} messages
                            </span>
                          </div>
                        </SidebarMenuButton>

                        {/* three-dots dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0 cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleContinueChat(chat)
                              }}
                              className="cursor-pointer"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Continue Chat
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteChat(chat._id!)
                              }}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            )}
          </SidebarContent>
        </Sidebar>

        {/* Fixed Chat Container - Like sidebar positioning */}
        <div 
          className="fixed top-16 bottom-0 right-0 z-40 flex flex-col border-l bg-background"
          style={{ 
            left: isMobile ? (openMobile ? '280px' : '0') : (open ? '280px' : '64px'),
            transition: 'left 0.2s ease-in-out'
          }}
        >
          {/* Chat Messages Area - Native scrolling */}
          <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
            <div className="p-4 h-full">
              {currentChat ? (
                <div className="space-y-4 max-w-4xl mx-auto pb-5 pt-5">
                  {currentChat.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex w-full ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-xs ${
                          msg.sender === "user"
                            ? "flex-row-reverse lg:max-w-md xl:max-w-lg"
                            : "flex-row lg:max-w-md xl:max-w-lg"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 ${
                            msg.sender === "user" ? "ml-3" : "mr-3"
                          }`}
                        >
                          {msg.sender === "user" ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                              <User className="h-4 w-4 text-primary-foreground" />
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                              <Bot className="h-4 w-4 text-secondary-foreground" />
                            </div>
                          )}
                        </div>

                        <div
                          className={`rounded-lg px-4 py-3 ${
                            msg.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed break-words hyphens-auto">
                            {msg.text}
                          </p>
                          <p className="mt-2 text-xs opacity-70">
                            {(() => {
                              const t = typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp;
                              return t && typeof t.toLocaleTimeString === 'function' ? t.toLocaleTimeString() : '';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )) || []}
                  {/* Invisible div to scroll to */}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-md text-center">
                    <Bot className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                    <h2 className="mb-2 text-xl font-semibold">
                      Welcome to Healthcare Assistant
                    </h2>
                    <p className="mb-4 text-muted-foreground">
                      Start a conversation to get help with your health
                      questions
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ask about blood pressure, exercise, diet and more
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Input Bar with Textarea */}
          <div className="border-t bg-background p-4">
            <div className="flex space-x-2 max-w-4xl mx-auto items-end">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  placeholder="Ask about your health concerns… "
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value)
                    adjustTextareaHeight(e.target)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  disabled={loading}
                  className="min-h-[40px] max-h-[120px] resize-none overflow-hidden"
                  rows={1}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="cursor-pointer h-10 w-10 p-0 flex-shrink-0"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

const HealthcareChatBot: React.FC = () => (
  <SidebarProvider defaultOpen={false}>
    <HealthcareChatBotContent />
  </SidebarProvider>
)

export default HealthcareChatBot
