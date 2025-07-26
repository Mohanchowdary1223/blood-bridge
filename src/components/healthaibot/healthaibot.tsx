"use client"

import React, { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

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

const HealthcareChatBotContent: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const { open, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar()

  /* ------------------------------------------------------------------ */
  /*                     Seed data on first render                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const sample: ChatSession[] = [
      {
        _id: "1",
        title: "Blood Pressure Consultation",
        messages: [
          {
            id: "1",
            text: "Hello! I have concerns about my blood pressure readings.",
            sender: "user",
            timestamp: new Date("2025-07-25T10:00:00"),
          },
          {
            id: "2",
            text: "I understand your concern about blood pressure. Can you tell me your recent readings and any symptoms you've been experiencing?",
            sender: "bot",
            timestamp: new Date("2025-07-25T10:00:30"),
          },
        ],
        createdAt: new Date("2025-07-25"),
      },
      {
        _id: "2",
        title: "Exercise and Fitness",
        messages: [
          {
            id: "3",
            text: "What exercises are best for heart health?",
            sender: "user",
            timestamp: new Date("2025-07-24T14:00:00"),
          },
          {
            id: "4",
            text: "Great question! For heart health, I recommend cardio exercises like walking, swimming, cycling.",
            sender: "bot",
            timestamp: new Date("2025-07-24T14:00:30"),
          },
        ],
        createdAt: new Date("2025-07-24"),
      },
      {
        _id: "3",
        title: "Diet and Nutrition Query",
        messages: [
          {
            id: "5",
            text: "What foods should I avoid for better heart health?",
            sender: "user",
            timestamp: new Date("2025-07-23T09:00:00"),
          },
          {
            id: "6",
            text: "For heart health, limit processed foods high in sodium, trans fats and saturated fats.",
            sender: "bot",
            timestamp: new Date("2025-07-23T09:00:30"),
          },
        ],
        createdAt: new Date("2025-07-23"),
      },
    ]
    setChatHistory(sample)
    setCurrentChat(sample[0])
  }, [])

  /* ------------------------------------------------------------------ */
  /*                       Bot reply generator                          */
  /* ------------------------------------------------------------------ */
  const getHealthcareResponse = (msg: string): string => {
    const m = msg.toLowerCase()

    if (m.includes("blood pressure") || m.includes("bp"))
      return "Blood pressure management involves: 1) Regular monitoring, 2) Low sodium diet, 3) Regular exercise, 4) Stress management, 5) Adequate sleep. Normal BP is < 120/80. Please consult a professional."
    if (m.includes("heart rate") || m.includes("pulse"))
      return "Normal resting heart-rate for adults is 60-100 BPM. Athletes may have 40-60 BPM."
    if (m.includes("exercise") || m.includes("workout"))
      return "Aim for 150 min moderate cardio weekly plus 2 strength sessions."
    if (m.includes("diet") || m.includes("nutrition"))
      return "Heart-healthy diet: fruits, vegetables, whole grains, lean proteins, healthy fats. Limit sodium & sugar."
    if (m.includes("emergency") || m.includes("urgent"))
      return "⚠️ MEDICAL EMERGENCY: Call 911 immediately for chest pain, trouble breathing, severe headache."
    return "I can help with blood pressure, heart rate, exercise, diet and more. Ask away!"
  }

  /* ------------------------------------------------------------------ */
  /*                            Handlers                                */
  /* ------------------------------------------------------------------ */
  const sendMessage = () => {
    if (!inputMessage.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setLoading(true)

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getHealthcareResponse(inputMessage),
        sender: "bot",
        timestamp: new Date(),
      }

      let newChat: ChatSession

      if (currentChat) {
        newChat = {
          ...currentChat,
          messages: [...currentChat.messages, userMsg, botMsg],
        }
        setChatHistory((prev) =>
          prev.map((c) => (c._id === newChat._id ? newChat : c)),
        )
      } else {
        newChat = {
          _id: Date.now().toString(),
          title:
            inputMessage.slice(0, 30) + (inputMessage.length > 30 ? "…" : ""),
          messages: [userMsg, botMsg],
          createdAt: new Date(),
        }
        setChatHistory((prev) => [newChat, ...prev])
      }

      setCurrentChat(newChat)
      setInputMessage("")
      setLoading(false)
    }, 1000)
  }

  const deleteChat = (id: string) => {
    setChatHistory((prev) => prev.filter((c) => c._id !== id))

    if (currentChat && currentChat._id === id) {
      const remaining = chatHistory.filter((c) => c._id !== id)
      setCurrentChat(remaining[0] ?? null)
    }

    setShowDeleteSuccess(true)
    setTimeout(() => setShowDeleteSuccess(false), 3000)
  }

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

  /* ------------------------------------------------------------------ */
  /*                            JSX                                     */
  /* ------------------------------------------------------------------ */
  return (
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
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setCurrentChat(null)}
                className="w-full cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                <span>Back</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleNewChat}
                className="w-full cursor-pointer"
              >
                <Plus className="size-4" />
                <span>New Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton className="w-full cursor-default" disabled>
                <History className="size-4" />
                <span>Recent Chats</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {(isMobile ? openMobile : open) && (
            <ScrollArea className="flex-1 px-2">
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
                            {chat.messages.length} messages
                          </span>
                        </div>
                      </SidebarMenuButton>

                      {/* three-dots dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            /* always visible on mobile, hover-to-show on ≥md */
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
            </ScrollArea>
          )}
        </SidebarContent>
      </Sidebar>

      {/* main panel */}
      <SidebarInset className="mt-16 flex flex-1 flex-col min-w-0">
        <div
          className={`flex min-h-0 flex-1 flex-col pb-20 ${
            !openMobile && isMobile ? "pt-16" : "pt-0"
          }`}
        >
          <ScrollArea className="flex-1">
            <div className="w-full p-4">
              {currentChat ? (
                <div className="mx-auto w-full max-w-4xl space-y-4">
                  {currentChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex w-full ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-xs flex-row ${
                          msg.sender === "user"
                            ? "flex-row-reverse lg:max-w-md xl:max-w-lg"
                            : "lg:max-w-md xl:max-w-lg"
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
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.text}
                          </p>
                          <p className="mt-2 text-xs opacity-70">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[400px] items-center justify-center">
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
          </ScrollArea>
        </div>

        {/* input bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background p-4 md:left-16">
          <div className="mx-auto flex w-full max-w-4xl space-x-2">
            <Input
              placeholder="Ask about your health concerns…"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}

const HealthcareChatBot: React.FC = () => (
  <SidebarProvider defaultOpen={false}>
    <HealthcareChatBotContent />
  </SidebarProvider>
)

export default HealthcareChatBot
