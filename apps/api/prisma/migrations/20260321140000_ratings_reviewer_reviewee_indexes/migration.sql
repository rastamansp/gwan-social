-- CreateIndex
CREATE INDEX "ratings_reviewer_id_created_at_idx" ON "ratings" ("reviewer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ratings_reviewee_id_idx" ON "ratings" ("reviewee_id");
