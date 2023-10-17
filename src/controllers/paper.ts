import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { papers } from "../db/schema/paper";
import { LibsqlError } from "@libsql/client";

export class PaperController {
  async create(newPaper: {
    title: string;
    keywords: string;
    abstract: string;
    authorGroupId: string;
    S3FileId: string;
  }) {
    const { title, keywords, abstract, authorGroupId, S3FileId } = newPaper
    const paper = { title, keywords, abstract, authorGroupId, S3FileId }

    try {
      await db.insert(papers).values(paper)
      return { success: true, message: '创建成功' }
    } catch (err) {
      if (err instanceof LibsqlError && (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || err.code === 'PROXY_ERROR'))
        return { success: false, message: '论文ID出现重复' }
      else return { success: false, message: '服务器内部错误' }
    }
  }
  
  async getContent(id: string) {
    try {
      const paper = await db.select().from(papers).where(eq(papers.id, id))
      return { success: true, res: paper, message: "查询成功" }
    } catch (err) {
      return { success: false, message: "论文不存在" }
    }
  }

  async getList() {
    try {
      const paperList = await db.select().from(papers)
      return { success: true, res: paperList, message: "查询成功" }
    } catch (err) {
      return { success: false, message: "论文不存在" }
    }
  }
}
