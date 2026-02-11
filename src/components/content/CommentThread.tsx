'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { buildLoginHref } from '@/lib/routes'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'

type CommentItem = {
  id: string
  content: string
  createdAt: string
  parentId: string | null
  user: {
    id: string
    name: string | null
    image: string | null
  }
  upvoteCount: number
  viewerHasUpvoted: boolean
}

interface CommentThreadProps {
  postId: string
  comments: CommentItem[]
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function CommentThread({ postId, comments }: CommentThreadProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({})
  const [replyValue, setReplyValue] = useState<Record<string, string>>({})
  const [replying, setReplying] = useState<Record<string, boolean>>({})
  const [votePending, setVotePending] = useState<Record<string, boolean>>({})
  const [voteCount, setVoteCount] = useState<Record<string, number>>(() =>
    Object.fromEntries(comments.map((comment) => [comment.id, comment.upvoteCount])),
  )
  const [viewerVoted, setViewerVoted] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(comments.map((comment) => [comment.id, comment.viewerHasUpvoted])),
  )
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)

  const { roots, childrenByParent } = useMemo(() => {
    const byParent = new Map<string, CommentItem[]>()
    const rootItems: CommentItem[] = []

    for (const comment of comments) {
      if (!comment.parentId) {
        rootItems.push(comment)
        continue
      }
      const bucket = byParent.get(comment.parentId) || []
      bucket.push(comment)
      byParent.set(comment.parentId, bucket)
    }

    return { roots: rootItems, childrenByParent: byParent }
  }, [comments])

  const handleReply = async (parentId: string) => {
    if (!session) {
      router.push(buildLoginHref(pathname || '/'))
      return
    }

    const content = replyValue[parentId]?.trim() || ''
    if (!content) return

    setReplying((prev) => ({ ...prev, [parentId]: true }))
    setMessage(null)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, parentId, content }),
      })

      const body = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(body?.error || 'Failed to post reply')
      }

      setReplyValue((prev) => ({ ...prev, [parentId]: '' }))
      setReplyOpen((prev) => ({ ...prev, [parentId]: false }))
      setMessage({ tone: 'success', text: 'Reply posted.' })
      router.refresh()
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Failed to post reply',
      })
    } finally {
      setReplying((prev) => ({ ...prev, [parentId]: false }))
    }
  }

  const handleUpvote = async (commentId: string) => {
    if (!session) {
      router.push(buildLoginHref(pathname || '/'))
      return
    }

    setVotePending((prev) => ({ ...prev, [commentId]: true }))
    setMessage(null)

    try {
      const response = await fetch('/api/comments/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      })

      const body = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(body?.error || 'Failed to vote')
      }

      setViewerVoted((prev) => ({ ...prev, [commentId]: body.voted }))
      setVoteCount((prev) => ({ ...prev, [commentId]: body.count }))
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Failed to vote',
      })
    } finally {
      setVotePending((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  const renderComment = (comment: CommentItem, depth = 0): React.ReactNode => {
    const replies = childrenByParent.get(comment.id) || []
    const count = voteCount[comment.id] ?? comment.upvoteCount
    const voted = viewerVoted[comment.id] ?? comment.viewerHasUpvoted
    const indent = depth > 0 ? 'ml-6 border-l border-black/15 pl-4' : ''

    return (
      <div key={comment.id} className={`space-y-3 ${indent}`}>
        <div className="flex gap-3">
          {comment.user.image ? (
            <Image
              src={comment.user.image}
              alt={comment.user.name || 'User'}
              width={36}
              height={36}
              unoptimized
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8d7be] text-sm">
              🦞
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{comment.user.name || 'Anonymous'}</span>
              <span className="text-gray-500">{formatTimestamp(comment.createdAt)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-gray-800">{comment.content}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={voted ? 'secondary' : 'ghost'}
                disabled={votePending[comment.id]}
                onClick={() => handleUpvote(comment.id)}
              >
                {voted ? 'Upvoted' : 'Upvote'} ({count})
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  setReplyOpen((prev) => ({
                    ...prev,
                    [comment.id]: !prev[comment.id],
                  }))
                }
              >
                Reply
              </Button>
            </div>
            {replyOpen[comment.id] && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyValue[comment.id] || ''}
                  onChange={(event) =>
                    setReplyValue((prev) => ({
                      ...prev,
                      [comment.id]: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-700 focus:ring-amber-700"
                  placeholder="Write a reply..."
                  maxLength={4000}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    disabled={replying[comment.id] || !(replyValue[comment.id] || '').trim()}
                    onClick={() => handleReply(comment.id)}
                  >
                    {replying[comment.id] ? 'Posting...' : 'Post reply'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        {replies.length > 0 && <div className="space-y-4">{replies.map((item) => renderComment(item, depth + 1))}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && <Notice tone={message.tone} message={message.text} />}
      {roots.map((comment) => renderComment(comment))}
    </div>
  )
}
