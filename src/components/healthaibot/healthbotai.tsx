"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Plus,
  Send,
  Droplets,
  User,
  History,
  AlertCircle,
  Lock,
  Share2,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  isTyping?: boolean
}

// Typing Text Component
const TypingText: React.FC<{ text: string; onComplete: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 20) // Adjust typing speed here (20ms per character)

      return () => clearTimeout(timeout)
    } else if (currentIndex === text.length && onComplete) {
      onComplete()
    }
  }, [currentIndex, text, onComplete])

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block"
        >
          |
        </motion.span>
      )}
    </span>
  )
}

const PublicHealthChatBotContent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [questionsUsed, setQuestionsUsed] = useState(0)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const { open, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar()
  const router = useRouter()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const MAX_QUESTIONS = 3

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (questionsUsed >= MAX_QUESTIONS) {
      setIsLimitReached(true)
    }
  }, [questionsUsed])

  const generateMockResponse = (): string => {
    const responses = [
      "Thank you for your question. For basic health guidelines, I recommend consulting with healthcare professionals for personalized advice. Stay hydrated, eat balanced meals, and exercise regularly.",
      "For general health information, maintaining a healthy lifestyle with proper diet and exercise is important. However, for specific medical concerns, please consult a qualified healthcare provider.",
      "General wellness tips include getting adequate sleep, managing stress, and staying active. For detailed health guidance and personalized recommendations, consider registering as a donor to access our full healthcare assistant.",
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLimitReached) return
    
    setLoading(true)
    
    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: "user",
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, userMessage])
      setInputMessage("")
      setQuestionsUsed(prev => prev + 1)
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: generateMockResponse(),
          sender: "bot",
          timestamp: new Date(),
          isTyping: true,
        }
        
        setMessages(prev => [...prev, botResponse])
        setLoading(false)
      }, 1500)
      
    } catch (error) {
      console.error("Failed to send message:", error)
      setLoading(false)
    }
  }

  const handleTypingComplete = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isTyping: false } : msg
      )
    )
  }

  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    } else {
      setOpen(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setQuestionsUsed(0)
    setIsLimitReached(false)
    closeSidebar()
  }

  const handleHistoryClick = () => {
    if (!open && !isMobile) {
      setOpen(true)
    } else if (!openMobile && isMobile) {
      setOpenMobile(true)
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  const handleRegisterClick = () => {
    router.push("/register")
  }

  const handleSignupClick = () => {
    router.push("/signup")
  }

  const handleSigninClick = () => {
    router.push("/signin")
  }

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

              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton 
                      className={`w-full ${!open && !isMobile ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={!open && !isMobile ? handleHistoryClick : undefined}
                      disabled={open || isMobile}
                    >
                      <History className="size-4" />
                      <span>Chat History</span>
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

            {(isMobile ? openMobile : open) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 overflow-y-auto px-2 pb-20"
              >
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Lock className="mx-auto mb-2 h-8 w-8" />
                  <p>Chat history is available for registered users only.</p>
                  <p className="mt-2">Register as a donor to save your conversations.</p>
                </div>
              </motion.div>
            )}
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
              {messages.length > 0 ? (
                <div className="space-y-4 max-w-4xl mx-auto pb-5 pt-5">
                  {!isLimitReached && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You have <strong>{MAX_QUESTIONS - questionsUsed}</strong> question{MAX_QUESTIONS - questionsUsed !== 1 ? 's' : ''} remaining. Register as a donor for unlimited access.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
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
                            transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 30 }}
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
                            transition={{ delay: 0.2 }}
                            className={`rounded-lg px-4 py-3 ${
                              msg.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-relaxed break-words hyphens-auto">
                              {msg.sender === "bot" && msg.isTyping ? (
                                <TypingText 
                                  text={msg.text} 
                                  onComplete={() => handleTypingComplete(msg.id)}
                                />
                              ) : (
                                msg.text
                              )}
                            </p>
                            <p className="mt-2 text-xs opacity-70">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLimitReached && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="flex w-full justify-center"
                    >
                      <div className="max-w-md rounded-lg bg-orange-50 border border-orange-200 p-6 text-center">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Lock className="mx-auto mb-3 h-12 w-12 text-orange-500" />
                        </motion.div>
                        <h3 className="mb-2 text-lg font-semibold text-orange-800">
                          Question Limit Reached
                        </h3>
                        <p className="mb-4 text-sm text-orange-700">
                          You've used all your free questions. Please register as a donor or sign up to continue chatting with our healthcare assistant.
                        </p>
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex gap-2 justify-center"
                        >
                          <Button 
                            onClick={handleRegisterClick}
                            size="sm"
                            className="cursor-pointer"
                          >
                            Register as Donor
                          </Button>
                          <Button 
                            onClick={handleSignupClick}
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                          >
                            Sign Up
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex h-full items-center justify-center"
                >
                  <div className="max-w-md text-center">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      }}
                    >
                      <Droplets className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                    </motion.div>
                    <h2 className="mb-2 text-xl font-semibold">
                      Welcome to Healthcare Assistant
                    </h2>
                    <p className="mb-4 text-muted-foreground">
                      Get basic health guidelines and information
                    </p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>You have {MAX_QUESTIONS} free questions</strong> to ask about health guidelines. Register as a donor for unlimited access and personalized assistance.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                    <p className="text-sm text-muted-foreground">
                      Ask about general health, wellness tips, and basic guidelines
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="border-t bg-background p-4"
          >
            <div className="flex space-x-2 max-w-4xl mx-auto items-end">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    isLimitReached 
                      ? "Please register to continue chatting..." 
                      : `Ask about health guidelines… (Enter to send - ${MAX_QUESTIONS - questionsUsed} questions left)`
                  }
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value)
                    adjustTextareaHeight(e.target)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (!isLimitReached) {
                        sendMessage()
                      }
                    }
                  }}
                  disabled={loading || isLimitReached}
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
                  disabled={loading || !inputMessage.trim() || isLimitReached}
                  className="cursor-pointer h-10 w-10 p-0 flex-shrink-0"
                >
                  {loading ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 rounded-full border-2 border-muted border-t-primary" 
                    />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </div>
            
            {isLimitReached && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-2 text-center"
              >
                <p className="text-xs text-muted-foreground mb-2">
                  Want unlimited access to our healthcare assistant?
                </p>
                <div className="flex gap-2 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={handleRegisterClick}
                      size="sm"
                      variant="outline"
                      className="cursor-pointer text-xs"
                    >
                      Register as Donor
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={handleSignupClick}
                      size="sm"
                      variant="outline"
                      className="cursor-pointer text-xs"
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Fixed bottom-right share button */}
        <div className="fixed bottom-20 right-4 z-50">
          <DropdownMenu open={isShareOpen} onOpenChange={setIsShareOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold w-10 h-10  transition-all duration-200 cursor-pointer flex items-center justify-center"
              >
                <Share2 className="w-8 h-8" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Share This Chat</h3>
                <p className="text-sm text-gray-600">To share conversations, please register or sign in for full access.</p>
              </div>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onClick={handleRegisterClick}
                className="py-2 px-4 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2 text-gray-700 font-medium"
              >
                Register as Donor
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSignupClick}
                className="py-2 px-4 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2 text-gray-700 font-medium"
              >
                Sign Up
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSigninClick}
                className="py-2 px-4 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2 text-gray-700 font-medium"
              >
                Already a user? Sign In
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}

const PublicHealthChatBot: React.FC = () => (
  <SidebarProvider defaultOpen={false}>
    <PublicHealthChatBotContent />
  </SidebarProvider>
)

export default PublicHealthChatBot
