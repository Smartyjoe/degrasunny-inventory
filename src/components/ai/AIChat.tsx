/**
 * AI Chat Component
 * Floating chat widget for natural language business queries
 */

import React, { useState, useRef, useEffect } from 'react'
import { X, Send, MessageSquare, Sparkles, Loader2 } from 'lucide-react'
import { useAIChat } from '@/hooks/useAI'
import { contextBuilder } from '@/services/ai/contextBuilder'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'

interface AIChatProps {
  products: any[]
  sales: any[]
  dashboardStats?: any
}

export const AIChat: React.FC<AIChatProps> = ({ products, sales, dashboardStats }) => {
  const { messages, isOpen, isLoading, sendMessage, setOpen, clearChat, getSuggestedQuestions } = useAIChat()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const context = contextBuilder.buildContext({ products, sales, dashboardStats })
  const suggestedQuestions = getSuggestedQuestions(context)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')

    await sendMessage(userMessage, context)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col shadow-2xl z-50 border-blue-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">AI Business Assistant</h3>
            <p className="text-xs text-blue-100">Ask me anything about your business</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-white hover:bg-blue-800 rounded p-1 transition-colors"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-700 mb-2">Welcome to AI Assistant</h4>
            <p className="text-sm text-gray-500 mb-4">
              Ask questions about your business performance, inventory, or get recommendations.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 mb-2">Suggested questions:</p>
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="block w-full text-left text-sm text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {format(message.timestamp, 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-gray-500 hover:text-gray-700 mt-2"
          >
            Clear conversation
          </button>
        )}
      </div>
    </Card>
  )
}
