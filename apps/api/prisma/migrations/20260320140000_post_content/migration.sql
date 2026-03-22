-- AlterTable: single text field `content` replaces `title` + `description`
ALTER TABLE "posts" ADD COLUMN "content" TEXT;

UPDATE "posts" SET "content" = CASE
  WHEN trim(COALESCE("title", '')) = '' AND trim(COALESCE("description", '')) = '' THEN ''
  WHEN trim(COALESCE("title", '')) = '' THEN trim("description")
  WHEN trim(COALESCE("description", '')) = '' THEN trim("title")
  ELSE trim("title") || E'\n\n' || trim("description")
END;

ALTER TABLE "posts" ALTER COLUMN "content" SET NOT NULL;

ALTER TABLE "posts" DROP COLUMN "title";
ALTER TABLE "posts" DROP COLUMN "description";
