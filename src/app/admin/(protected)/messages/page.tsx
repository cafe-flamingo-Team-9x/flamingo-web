'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mail, MessageSquare, Trash2, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, cn } from '@/lib/utils';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contact');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      const response = await fetch(`/api/contact/${messageToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(messages.filter((m) => m.id !== messageToDelete.id));
      toast.success('Message deleted successfully');
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleMarkAsRead = async (message: Message) => {
    if (message.read) return;

    try {
      const response = await fetch(`/api/contact/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      setMessages(
        messages.map((m) => (m.id === message.id ? { ...m, read: true } : m))
      );
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all customer messages and inquiries
          </p>
        </div>
        <Button
          onClick={fetchMessages}
          disabled={isLoading}
          variant="outline"
          size="icon"
          className="transition-transform duration-150 hover:-translate-y-0.5"
        >
          <RefreshCcw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {messages.filter((m) => !m.read).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {messages.filter((m) => m.read).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Table */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle>Customer Inquiries</CardTitle>
          <CardDescription>
            List of all messages received from your website visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground/70">
                Messages from your website will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="w-[30%]">From</TableHead>
                    <TableHead className="hidden md:table-cell w-[25%]">
                      Subject
                    </TableHead>
                    <TableHead className="hidden sm:table-cell w-[15%]">
                      Date
                    </TableHead>
                    <TableHead className="w-[10%] text-center">
                      Status
                    </TableHead>
                    <TableHead className="w-[20%] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow
                      key={message.id}
                      className={`border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${
                        !message.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-foreground font-medium">
                            {message.name}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {message.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-xs">
                        {message.subject}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(new Date(message.createdAt))}
                      </TableCell>
                      <TableCell className="text-center">
                        {!message.read && (
                          <Badge variant="default" className="bg-primary/80">
                            New
                          </Badge>
                        )}
                        {message.read && (
                          <Badge variant="secondary">Read</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMessage(message);
                              handleMarkAsRead(message);
                            }}
                            className="h-8"
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMessageToDelete(message)}
                            className="h-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedMessage.subject}
                </DialogTitle>
                <DialogDescription asChild className="pt-2 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {selectedMessage.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.email}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(selectedMessage.createdAt))}
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="border-t border-border/50 pt-6">
                <p className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMessage(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setMessageToDelete(selectedMessage);
                    setSelectedMessage(null);
                  }}
                  className="flex-1"
                >
                  Delete Message
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!messageToDelete}
        onOpenChange={(open) => !open && setMessageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message from{' '}
              {messageToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-medium">Message Details:</p>
            <p className="text-sm text-muted-foreground">
              <strong>From:</strong> {messageToDelete?.name} (
              {messageToDelete?.email})
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Subject:</strong> {messageToDelete?.subject}
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
