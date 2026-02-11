ALTER TABLE "Comment"
ADD COLUMN IF NOT EXISTS "parentId" TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Comment_parentId_fkey'
    ) THEN
        ALTER TABLE "Comment"
        ADD CONSTRAINT "Comment_parentId_fkey"
        FOREIGN KEY ("parentId")
        REFERENCES "Comment"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "Comment_postId_createdAt_idx"
ON "Comment"("postId", "createdAt");

CREATE INDEX IF NOT EXISTS "Comment_parentId_createdAt_idx"
ON "Comment"("parentId", "createdAt");

CREATE TABLE IF NOT EXISTS "CommentUpvote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "CommentUpvote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CommentUpvote_userId_commentId_key"
ON "CommentUpvote"("userId", "commentId");

CREATE INDEX IF NOT EXISTS "CommentUpvote_commentId_idx"
ON "CommentUpvote"("commentId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'CommentUpvote_userId_fkey'
    ) THEN
        ALTER TABLE "CommentUpvote"
        ADD CONSTRAINT "CommentUpvote_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'CommentUpvote_commentId_fkey'
    ) THEN
        ALTER TABLE "CommentUpvote"
        ADD CONSTRAINT "CommentUpvote_commentId_fkey"
        FOREIGN KEY ("commentId")
        REFERENCES "Comment"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;
