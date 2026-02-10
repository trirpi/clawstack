-- Ensure Report table exists for databases baselined from pre-migration state.
CREATE TABLE IF NOT EXISTS "Report" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "details" TEXT,
    "postSlug" TEXT,
    "publicationSlug" TEXT,
    "sourceUrl" TEXT,
    "reporterIp" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Report_postId_fkey'
    ) THEN
        ALTER TABLE "Report"
        ADD CONSTRAINT "Report_postId_fkey"
        FOREIGN KEY ("postId")
        REFERENCES "Post"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Report_publicationId_fkey'
    ) THEN
        ALTER TABLE "Report"
        ADD CONSTRAINT "Report_publicationId_fkey"
        FOREIGN KEY ("publicationId")
        REFERENCES "Publication"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;
