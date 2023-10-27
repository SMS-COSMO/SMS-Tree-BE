import type { TRawPaper } from '../db/db'

export type TPaper = ReturnType<typeof paperSerializer>

export function paperSerializer(paper: TRawPaper) {
  return {
    id: paper.id,
    title: paper.title,
    keywords: paper.keywords,
    abstract: paper.abstract,
    authorGroupId: paper.authorGroupId,
    status: paper.status,
    downloadCount: paper.downloadCount,
    isFeatured: paper.isFeatured,
    canDownload: paper.canDownload,
    rate: paper.rate,
    createdAt: paper.createdAt,
  }
}

export function paperFileSerializer(paper: TRawPaper) {
  return {
    S3FileId: paper.S3FileId,
  }
}
