'use client'

import { useState } from 'react'
import { ChatSession } from '@/types'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { renameChatSession, archiveChatSession, deleteChatSession } from '@/lib/api/chat'
import { useChatStore } from '@/stores'
import { Plus, MoreVertical, Edit2, Archive, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionTabsProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelect: (sessionId: string) => void
  onNewSession: () => void
}

export function SessionTabs({
  sessions,
  currentSessionId,
  onSelect,
  onNewSession,
}: SessionTabsProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [sessionToRename, setSessionToRename] = useState<ChatSession | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const { updateSession, archiveSession, deleteSession } = useChatStore()

  const handleRename = async () => {
    if (!sessionToRename || !newTitle.trim()) return

    try {
      await renameChatSession(sessionToRename.id, newTitle)
      updateSession(sessionToRename.id, { title: newTitle })
      setRenameDialogOpen(false)
    } catch (err) {
      console.error('Failed to rename session:', err)
    }
  }

  const handleArchive = async (session: ChatSession) => {
    try {
      await archiveChatSession(session.id)
      archiveSession(session.id)
    } catch (err) {
      console.error('Failed to archive session:', err)
    }
  }

  const handleDelete = async (session: ChatSession) => {
    if (!confirm('Are you sure you want to delete this chat?')) return

    try {
      await deleteChatSession(session.id)
      deleteSession(session.id)
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  return (
    <>
      <div className="border-b">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-1 p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors group',
                  currentSessionId === session.id
                    ? 'bg-pink-100 text-pink-700'
                    : 'hover:bg-muted'
                )}
              >
                <button
                  className="text-sm font-medium truncate max-w-[120px]"
                  onClick={() => onSelect(session.id)}
                >
                  {session.title}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-6 w-6 p-0 opacity-0 group-hover:opacity-100',
                        currentSessionId === session.id && 'opacity-100'
                      )}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSessionToRename(session)
                        setNewTitle(session.title)
                        setRenameDialogOpen(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchive(session)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(session)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0"
              onClick={onNewSession}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Chat
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat session.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Chat name..."
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} className="bg-pink-500 hover:bg-pink-600">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
