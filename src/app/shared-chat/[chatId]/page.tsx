/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
import {
  ArrowLeft,
  Droplets,
  User,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: string | Date
}

interface ChatSession {
  _id?: string
  title: string
  messages: Message[]
  createdAt: string | Date
}

const SharedChatPageContent: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const chatId = params?.chatId as string
  const [chat, setChat] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const { open, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get userId from localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUserId(user.id || user._id || null)
        } catch {}
      }
    }
  }, [])

  useEffect(() => {
    if (!chatId) return
    setLoading(true)
    fetch(`/api/healthaibot?id=${chatId}&shared=1`)
      .then(res => res.json())
      .then(data => {
        if (data.chat) setChat(data.chat)
        else setError("Chat not found.")
      })
      .catch(() => setError("Failed to load chat."))
      .finally(() => setLoading(false))
  }, [chatId])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chat?.messages])

  const handleContinue = async () => {
    if (!chat || !userId) {
      // Not logged in, redirect to healthbotai
      router.push("/healthbotai?shared=" + chatId)
      return
    }
    // For logged-in users, redirect to healthaibot with continue param
    router.push(`/healthaibot?continue=${chatId}`)
  }

  const handleCancel = () => {
    router.push("/home")
  }

  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    } else {
      setOpen(false)
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>
  if (!chat) return null

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {isMobile && !openMobile && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-20 left-4 z-[60]"
          >
            <SidebarTrigger className="h-10 w-10 cursor-pointer border bg-background shadow-md" />
          </motion.div>
        )}

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
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div 
          className="fixed top-16 bottom-0 right-0 z-40 flex flex-col border-l bg-background"
          style={{ 
            left: isMobile ? (openMobile ? '280px' : '0') : (open ? '280px' : '64px'),
            transition: 'left 0.2s ease-in-out'
          }}
        >
          <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
            <div className="p-4 h-full">
              <div className="space-y-4 max-w-4xl mx-auto pb-5 pt-5">
                <AnimatePresence>
                  {chat.messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
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
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.05 + 0.1, type: "spring", stiffness: 500, damping: 30 }}
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
                              <Droplets className="h-4 w-4 text-primary" />
                            </div>
                          )}
                        </motion.div>

                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: idx * 0.05 + 0.2 }}
                          className={`rounded-lg px-4 py-3 ${
                            msg.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed break-words hyphens-auto">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                          <p className="mt-2 text-xs opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="border-t bg-background p-4"
          >
            <div className="flex space-x-2 max-w-4xl mx-auto items-center justify-center">
              <Button
                onClick={handleContinue}
                className="cursor-pointer"
              >
                Continue Chat
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  )
}

const SharedChatPage: React.FC = () => (
  <SidebarProvider defaultOpen={false}>
    <SharedChatPageContent />
  </SidebarProvider>
)

export default SharedChatPage
