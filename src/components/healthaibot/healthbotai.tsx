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
  Droplets,
  Bot,
  User,
  History,
  AlertCircle,
  Lock,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const PublicHealthChatBotContent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [questionsUsed, setQuestionsUsed] = useState(0)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const { open, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar()
  const router = useRouter()
  
  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null) // Added for textarea auto-resize

  const MAX_QUESTIONS = 3

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check if user has reached the limit
  useEffect(() => {
    if (questionsUsed >= MAX_QUESTIONS) {
      setIsLimitReached(true)
    }
  }, [questionsUsed])

  // Simulate AI response for public users
  const generateMockResponse = (): string => {
    const responses = [
      "Thank you for your question. For basic health guidelines, I recommend consulting with healthcare professionals for personalized advice. Stay hydrated, eat balanced meals, and exercise regularly.",
      "For general health information, maintaining a healthy lifestyle with proper diet and exercise is important. However, for specific medical concerns, please consult a qualified healthcare provider.",
      "General wellness tips include getting adequate sleep, managing stress, and staying active. For detailed health guidance and personalized recommendations, consider registering as a donor to access our full healthcare assistant.",
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Auto-resize textarea function
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLimitReached) return
    
    setLoading(true)
    
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: "user",
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, userMessage])
      setInputMessage("")
      setQuestionsUsed(prev => prev + 1)
      
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      
      // Simulate AI response after a delay
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: generateMockResponse(),
          sender: "bot",
          timestamp: new Date(),
        }
        
        setMessages(prev => [...prev, botResponse])
        setLoading(false)
      }, 1500)
      
    } catch (error) {
      console.error("Failed to send message:", error)
      setLoading(false)
    }
  }

  // Helper function to close sidebar
  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    } else {
      setOpen(false)
    }
  }

  // New Chat handler - show limit message
  const handleNewChat = () => {
    // Reset to show the same limit message
    setMessages([])
    setQuestionsUsed(0)
    setIsLimitReached(false)
    closeSidebar()
  }

  // Handle history click - opens sidebar
  const handleHistoryClick = () => {
    if (!open && !isMobile) {
      setOpen(true)
    } else if (!openMobile && isMobile) {
      setOpenMobile(true)
    }
  }

  // Handle back/home button click - navigate to home
  const handleBackToHome = () => {
    router.push("/")
  }

  // Handle register/signup navigation
  const handleRegisterClick = () => {
    router.push("/register") // Update with your actual register route
  }

  const handleSignupClick = () => {
    router.push("/signup") // Update with your actual signup route
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden">
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

              {/* History Header with Tooltip */}
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

            {/* No chat history for public users */}
            {(isMobile ? openMobile : open) && (
              <div className="flex-1 overflow-y-auto px-2 pb-20"> {/* Added pb-20 for bottom padding */}
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Lock className="mx-auto mb-2 h-8 w-8" />
                  <p>Chat history is available for registered users only.</p>
                  <p className="mt-2">Register as a donor to save your conversations.</p>
                </div>
              </div>
            )}
          </SidebarContent>
        </Sidebar>

        {/* Fixed Chat Container */}
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
              {messages.length > 0 ? (
                <div className="space-y-4 max-w-4xl mx-auto pb-5 pt-5">
                  {/* Questions remaining alert */}
                  {!isLimitReached && (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You have <strong>{MAX_QUESTIONS - questionsUsed}</strong> question{MAX_QUESTIONS - questionsUsed !== 1 ? 's' : ''} remaining. Register as a donor for unlimited access.
                      </AlertDescription>
                    </Alert>
                  )}

                  {messages.map((msg) => (
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
                              <Droplets className="h-4 w-4 text-primary" />
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
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Limit reached message */}
                  {isLimitReached && (
                    <div className="flex w-full justify-center">
                      <div className="max-w-md rounded-lg bg-orange-50 border border-orange-200 p-6 text-center">
                        <Lock className="mx-auto mb-3 h-12 w-12 text-orange-500" />
                        <h3 className="mb-2 text-lg font-semibold text-orange-800">
                          Question Limit Reached
                        </h3>
                        <p className="mb-4 text-sm text-orange-700">
                          You've used all your free questions. Please register as a donor or sign up to continue chatting with our healthcare assistant.
                        </p>
                        <div className="flex gap-2 justify-center">
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
                        </div>
                      </div>
                    </div>
                  )}

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
                      Get basic health guidelines and information
                    </p>
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>You have {MAX_QUESTIONS} free questions</strong> to ask about health guidelines. Register as a donor for unlimited access and personalized assistance.
                      </AlertDescription>
                    </Alert>
                    <p className="text-sm text-muted-foreground">
                      Ask about general health, wellness tips, and basic guidelines
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
              <Button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim() || isLimitReached}
                className="cursor-pointer h-10 w-10 p-0 flex-shrink-0"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {isLimitReached && (
              <div className="mt-2 text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Want unlimited access to our healthcare assistant?
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={handleRegisterClick}
                    size="sm"
                    variant="outline"
                    className="cursor-pointer text-xs"
                  >
                    Register as Donor
                  </Button>
                  <Button 
                    onClick={handleSignupClick}
                    size="sm"
                    variant="outline"
                    className="cursor-pointer text-xs"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            )}
          </div>
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
