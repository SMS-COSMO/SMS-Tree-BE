import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { papers } from '../db/schema/paper'
import type { TPaper } from '../serializer/paper'
import { paperFileSerializer, paperSerializer } from '../serializer/paper'

export class PaperController {
  async create(newPaper: {
    title: string
    keywords: string[]
    abstract: string
    authorGroupId: string
    S3FileId: string
  }) {
    const { title, keywords, abstract, authorGroupId, S3FileId } = newPaper
    const paper = { title, keywords, abstract, authorGroupId, S3FileId }

    try {
      await db.insert(papers).values(paper)
      return { success: true, message: '创建成功' }
    }
    catch (err) {
      return { success: false, message: '服务器内部错误' }
    }
  }

  async getContent(id: string) {
    try {
      const paper = paperSerializer((await db.select().from(papers).where(eq(papers.id, id)))[0])
      return { success: true, res: paper, message: '查询成功' }
    }
    catch (err) {
      return { success: false, message: '论文不存在' }
    }
  }

  async getFile(id: string) {
    try {
      const paper = (await db.select().from(papers).where(eq(papers.id, id)))[0]
      const file = paperFileSerializer(paper)
      await db.update(papers).set({ downloadCount: paper.downloadCount + 1 }).where(eq(papers.id, id))
      return { success: true, res: file, message: '查询成功' }
    }
    catch (err) {
      return { success: false, message: '论文不存在' }
    }
  }

  async getList() {
    try {
      const res: Array<TPaper> = [];
      (await db.select().from(papers)).forEach((paper) => {
        res.push(paperSerializer(paper))
      })

      return { success: true, res, message: '查询成功' }
    }
    catch (err) {
      return { success: false, message: '论文不存在' }
    }
  }
}
