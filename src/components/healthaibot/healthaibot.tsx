/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Plus,
  Send,
  Trash2,
  History,
  MoreVertical,
  Droplets,
  MessageCircle,
  Share2,
  Mail,
  Copy,
  Check,
  Instagram,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from 'react-markdown'
import { FaWhatsapp } from 'react-icons/fa'

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  isTyping?: boolean
}

interface ChatSession {
  _id?: string
  title: string
  messages: Message[]
  createdAt: Date
}

// Typewriter component for bot messages with increased speed (10ms per character) and markdown support
const TypewriterText: React.FC<{ 
  text: string
  onComplete?: () => void
  isActive?: boolean
}> = ({ text, onComplete, isActive = true }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(text)
      return
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 10) // Increased speed (lower delay = faster)

      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, onComplete, isActive])

  useEffect(() => {
    if (isActive) {
      setDisplayedText("")
      setCurrentIndex(0)
    }
  }, [text, isActive])

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed break-words hyphens-auto">
      <ReactMarkdown 
        components={{
          strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
          em: ({ children }) => <em className="italic text-amber-600">{children}</em>,
          p: ({ children }) => <p className="mb-2">{children}</p>,
          ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
        }}
      >
        {displayedText}
      </ReactMarkdown>
      {isActive && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-4 bg-current ml-1"
        />
      )}
    </div>
  )
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
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false)
  const { open, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar()
  const router = useRouter()
  
  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  // On mount, get userId and fetch chat history or continue chat if ?continue= param is present
  useEffect(() => {
    const id = getUserIdFromLocalStorage();
    setUserId(id);
    if (!id) {
      setChatHistory([]);
      setCurrentChat(null);
      return;
    }

    // Check for ?continue= param in URL
    let continueChatId: string | null = null;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      continueChatId = url.searchParams.get('continue');
    }

    const fetchHistoryAndMaybeContinue = async () => {
      try {
        const res = await fetch("/api/healthaibot", {
          headers: { "x-user-id": id },
        });
        const data = await res.json();
        setChatHistory(data.history || []);

        if (continueChatId) {
          // Try to find the chat in history first
          const found = data.history?.find((c: any) => c._id === continueChatId);
          if (found) {
            setCurrentChat(found);
          } else {
            // If not found, fetch from shared endpoint and set as currentChat (read-only)
            const sharedRes = await fetch(`/api/healthaibot?id=${continueChatId}&shared=1`);
            const sharedData = await sharedRes.json();
            if (sharedData.chat) {
              setCurrentChat(sharedData.chat);
            } else {
              setCurrentChat(null);
            }
          }
        } else {
          setCurrentChat(null);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setCurrentChat(null);
      }
    };
    fetchHistoryAndMaybeContinue();
  }, []);

  // Share functionality

  // Generate a shareable link for the chat
  const generateShareLink = (chat: ChatSession) => {
    if (!chat._id) return window.location.origin
    return `${window.location.origin}/shared-chat/${chat._id}`
  }

  const generateShareContent = (chat: ChatSession) => {
    const title = chat.title
    const messageCount = chat.messages?.length || 0
    const link = generateShareLink(chat)
    return `Check out this healthcare conversation: "${title}" - ${messageCount} messages exchanged about health topics.\n\nView the chat: ${link}`
  }

  const handleWhatsAppShare = (chat: ChatSession) => {
    const shareText = generateShareContent(chat)
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleEmailShare = (chat: ChatSession) => {
    const shareText = generateShareContent(chat)
    const subject = `Healthcare Chat: ${chat.title}`
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`
    window.location.href = emailUrl
  }

  const handleInstagramShare = (chat: ChatSession) => {
    const shareText = generateShareContent(chat)
    // Instagram doesn't support direct sharing via URL, so we'll copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Content copied! You can now paste it on Instagram.')
    })
  }

  const handleCopyLink = (chat: ChatSession) => {
    const link = generateShareLink(chat)
    navigator.clipboard.writeText(link).then(() => {
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    })
  }

  // Current chat share functionality
  const handleCurrentChatShare = (type: 'whatsapp' | 'email' | 'instagram' | 'copy') => {
    if (!currentChat) return
    
    switch (type) {
      case 'whatsapp':
        handleWhatsAppShare(currentChat)
        break
      case 'email':
        handleEmailShare(currentChat)
        break
      case 'instagram':
        handleInstagramShare(currentChat)
        break
      case 'copy':
        handleCopyLink(currentChat)
        break
    }
    setShareDropdownOpen(false)
  }

  // Send message to backend with typing loading indicator
  const sendMessage = async () => {
    if (!inputMessage.trim() || !userId) return;
    setLoading(true);

    // Create a temporary typing message for loading
    const tempTypingId = `temp-${Date.now()}`;
    const tempTypingMsg: Message = {
      id: tempTypingId,
      text: "Typing...",
      sender: "bot",
      timestamp: new Date(),
      isTyping: true,
    };

    // Add user message and temp typing message to current chat
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    if (currentChat) {
      setCurrentChat({
        ...currentChat,
        messages: [...currentChat.messages, userMsg, tempTypingMsg],
      });
    } else {
      setCurrentChat({
        title: inputMessage.slice(0, 30) + (inputMessage.length > 30 ? "…" : ""),
        messages: [userMsg, tempTypingMsg],
        createdAt: new Date(),
      });
    }

    setInputMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

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

      // Remove temp typing message and add actual response
      if (data.chat?.messages) {
        const updatedMessages = data.chat.messages.filter((msg: Message) => msg.id !== tempTypingId);
        const latestMessage = updatedMessages[updatedMessages.length - 1];
        if (latestMessage?.sender === 'bot') {
          setTypingMessageId(latestMessage.id);
        }
        data.chat.messages = updatedMessages;
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
      // Remove temp typing on error
      if (currentChat) {
        setCurrentChat({
          ...currentChat,
          messages: currentChat.messages.filter((msg) => msg.id !== tempTypingId),
        });
      }
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
    setTypingMessageId(null)
    closeSidebar()
  }

  // Continue Chat handler with sidebar close
  const handleContinueChat = (chat: ChatSession) => {
    setCurrentChat(chat)
    setTypingMessageId(null)
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
        <AnimatePresence>
          {showDeleteSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="fixed top-20 right-4 z-[60] rounded-md bg-green-500 px-4 py-2 text-white shadow-lg"
            >
              Chat deleted successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Share Button - Bottom Right */}
        {currentChat && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-20 right-6 z-50"
          >
            <DropdownMenu open={shareDropdownOpen} onOpenChange={setShareDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold rounded-full h-10 w-10 cursor-pointer shadow-lg"
                  >
                    <Share2 className="w-8 h-8" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto p-2">
                {/* Social Media Icons Row */}
                <div className='flex flex-row gap-2'>
                  {/* WhatsApp */}
                  <DropdownMenuItem 
                    onClick={() => handleCurrentChatShare('whatsapp')} 
                    className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                    aria-label="Share via WhatsApp"
                  >
                    <FaWhatsapp className="w-5 h-5 text-green-600" />
                  </DropdownMenuItem>
                  
                  {/* Instagram */}
                  <DropdownMenuItem 
                    onClick={() => handleCurrentChatShare('instagram')} 
                    className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                    aria-label="Share via Instagram"
                  >
                    <Instagram className="w-5 h-5 text-pink-600" />
                  </DropdownMenuItem>
                  
                  {/* Email */}
                  <DropdownMenuItem 
                    onClick={() => handleCurrentChatShare('email')} 
                    className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                    aria-label="Share via Email"
                  >
                    <Mail className="w-5 h-5 text-blue-600" />
                  </DropdownMenuItem>
                </div>
           
                <DropdownMenuSeparator />
                
                {/* Copy Link */}
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    handleCurrentChatShare('copy');
                  }}
                  className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2 justify-center"
                >
                  {copyStatus === 'copied' ? (
                    <Check className="w-5 h-5 text-green-600" /> 
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  <span>{copyStatus === 'copied' ? 'Copied!' : 'Copy Link'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}

        {/* mobile sidebar trigger (below navbar) */}
        {isMobile && !openMobile && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="fixed top-20 left-4 z-[60]"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SidebarTrigger className="h-10 w-10 cursor-pointer border bg-background shadow-md" />
            </motion.div>
          </motion.div>
        )}

        {/* sidebar */}
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
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
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SidebarTrigger className="h-8 w-8 cursor-pointer" />
                    </motion.div>
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
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <SidebarMenuButton
                          onClick={handleBackToHome}
                          className="w-full cursor-pointer"
                        >
                          <ArrowLeft className="size-4" />
                          <span>Home</span>
                        </SidebarMenuButton>
                      </motion.div>
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
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <SidebarMenuButton
                          onClick={handleNewChat}
                          className="w-full cursor-pointer"
                        >
                          <Plus className="size-4" />
                          <span>New Chat</span>
                        </SidebarMenuButton>
                      </motion.div>
                    </TooltipTrigger>
                    {!open && !isMobile && (
                      <TooltipContent side="right">
                        <p>New Chat</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenuItem>

                {/* History Header with Tooltip - Clickable when collapsed - Changed to black */}
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={!open && !isMobile ? { scale: 1.02, x: 4 } : {}}
                        whileTap={!open && !isMobile ? { scale: 0.98 } : {}}
                      >
                        <SidebarMenuButton 
                          className={`w-full text-black ${!open && !isMobile ? 'cursor-pointer' : 'cursor-default'}`}
                          onClick={!open && !isMobile ? handleHistoryClick : undefined}
                          disabled={open || isMobile}
                        >
                          <History className="size-4 text-black" />
                          <span className="text-black">Recent Chats</span>
                        </SidebarMenuButton>
                      </motion.div>
                    </TooltipTrigger>
                    {!open && !isMobile && (
                      <TooltipContent side="right">
                        <p>Chat History</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>

              {/* Chat History List - Only show when sidebar is open, with highlighted titles */}
              {(isMobile ? openMobile : open) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 overflow-y-auto px-2 pb-20"
                >
                  <SidebarMenu>
                    {chatHistory.map((chat, index) => (
                      <motion.div
                        key={chat._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SidebarMenuItem>
                          <div className="group flex w-full items-center">
                            {/* chat title press with highlight */}
                            <motion.div
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1"
                            >
                              <SidebarMenuButton
                                onClick={() => handleContinueChat(chat)}
                                className="flex-1 min-h-[44px] justify-start pr-2 cursor-pointer "
                              >
                                <div className="flex w-full min-w-0 flex-col items-start">
                                  <span className="truncate text-sm font-bold text-muted-foreground"> {/* Highlighted title */}
                                    {chat.title}
                                  </span>
                                  <span className="truncate text-xs text-muted-foreground">
                                    {chat.messages?.length || 0} messages
                                  </span>
                                </div>
                              </SidebarMenuButton>
                            </motion.div>

                            {/* three-dots dropdown with share option */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 flex-shrink-0 cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </motion.div>
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

                                {/* Share submenu */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                      className="cursor-pointer flex items-center justify-between"
                                    >
                                      <div className="flex items-center">
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share Chat
                                      </div>
                                    </DropdownMenuItem>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent side="right" className="w-auto p-2">
                                    {/* Social Media Icons Row */}
                                    <div className='flex flex-row gap-2'>
                                      {/* WhatsApp */}
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleWhatsAppShare(chat)
                                        }} 
                                        className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                                        aria-label="Share via WhatsApp"
                                      >
                                        <FaWhatsapp className="w-5 h-5 text-green-600" />
                                      </DropdownMenuItem>
                                      
                                      {/* Instagram */}
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleInstagramShare(chat)
                                        }} 
                                        className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                                        aria-label="Share via Instagram"
                                      >
                                        <Instagram className="w-5 h-5 text-pink-600" />
                                      </DropdownMenuItem>
                                      
                                      {/* Email */}
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleEmailShare(chat)
                                        }} 
                                        className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                                        aria-label="Share via Email"
                                      >
                                        <Mail className="w-5 h-5 text-blue-600" />
                                      </DropdownMenuItem>
                                    </div>
                               
                                    <DropdownMenuSeparator />
                                    
                                    {/* Copy Link */}
                                    <DropdownMenuItem 
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        handleCopyLink(chat);
                                      }}
                                      className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2 justify-center"
                                    >
                                      {copyStatus === 'copied' ? (
                                        <Check className="w-5 h-5 text-green-600" /> 
                                      ) : (
                                        <Copy className="w-5 h-5" />
                                      )}
                                      <span>{copyStatus === 'copied' ? 'Copied!' : 'Copy Link'}</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>

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
                      </motion.div>
                    ))}
                  </SidebarMenu>
                </motion.div>
              )}
            </SidebarContent>
          </Sidebar>
        </motion.div>

        {/* Fixed Chat Container - Like sidebar positioning */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
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
                  {currentChat.messages?.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
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
                          transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 300 }}
                          className={`flex-shrink-0 ${
                            msg.sender === "user" ? "ml-3" : "mr-3"
                          }`}
                        >
                          {msg.sender === "user" ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                              {/* Show first letter of user name in uppercase */}
                              <span className="text-lg font-bold text-primary-foreground">
                                {(() => {
                                  if (typeof window !== 'undefined') {
                                    const userStr = localStorage.getItem('user');
                                    if (userStr) {
                                      try {
                                        const user = JSON.parse(userStr);
                                        const name = user.name || '';
                                        return name.charAt(0).toUpperCase() || 'U';
                                      } catch {}
                                    }
                                  }
                                  return 'U';
                                })()}
                              </span>
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                              {/* Animated droplet icon replacing bot icon */}
                              <motion.div
                                animate={{ 
                                  y: [0, -2, 0],
                                  scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                  repeat: Infinity,
                                  duration: 2,
                                  ease: "easeInOut"
                                }}
                              >
                                <Droplets className="h-4 w-4 text-primary" />
                              </motion.div>
                            </div>
                          )}
                        </motion.div>

                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className={`rounded-lg px-4 py-3 ${
                            msg.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {msg.sender === "bot" && (typingMessageId === msg.id || msg.isTyping) ? (
                            <TypewriterText 
                              text={msg.isTyping ? "Typing..." : msg.text}
                              onComplete={() => {
                                if (!msg.isTyping) setTypingMessageId(null)
                              }}
                              isActive={!msg.isTyping}
                            />
                          ) : msg.sender === "user" ? (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed break-words hyphens-auto">
                              {msg.text}
                            </p>
                          ) : (
                            <div className="text-sm leading-relaxed">
                              <ReactMarkdown 
                                components={{
                                  strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                                  em: ({ children }) => <em className="italic text-amber-600">{children}</em>,
                                  p: ({ children }) => <p className="mb-2">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                  li: ({ children }) => <li className="mb-1">{children}</li>,
                                }}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          )}
                          <p className="mt-2 text-xs opacity-70">
                            {(() => {
                              const t = typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp;
                              return t && typeof t.toLocaleTimeString === 'function' ? t.toLocaleTimeString() : '';
                            })()}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )) || []}
                  {/* Invisible div to scroll to */}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex h-full items-center justify-center"
                >
                  <div className="max-w-md text-center">
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    >
                      <Droplets className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mb-2 text-xl font-semibold"
                    >
                      Welcome to Healthcare Assistant
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mb-4 text-muted-foreground"
                    >
                      Start a conversation to get help with your health
                      questions
                    </motion.p>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-sm text-muted-foreground"
                    >
                      Ask about blood pressure, exercise, diet and more
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Fixed Input Bar with Textarea */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border-t bg-background p-4"
          >
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={sendMessage}
                  disabled={loading || !inputMessage.trim()}
                  className="cursor-pointer h-10 w-10 p-0 flex-shrink-0"
                >
                  {loading ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="h-4 w-4 rounded-full border-2 border-muted border-t-primary"
                    />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
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
