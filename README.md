## 为什么选择迁移到 `drizzle-orm`?

-   `prisma`确实是非常成熟的 ORM 解决方案，但是考虑到项目的轻量化以及`prisma`的配置语言学习成本，迁移至`drizzle-orm`对于熟悉 SQL 的人更加容易上手和易于维护。
-   `drizzle-orm` 社区非常活跃，遇到问题可以到 GitHub Discussions 或者 Discord 询问。

## 待讨论的问题

-   文件目录结构（纠结`auth.ts`这种文件放在哪里好）
-   代码审计 优化代码
-   自动化测试

## 可参考的资源

-   drizzle-orm 文档： https://orm.drizzle.team/docs/quick-start
-   trpc 文档： https://trpc.io/docs/
-   测试服务器： https://sms-tree-backend-raimoethedev.koyeb.app/trpc
-   测试服务器生成的文档： https://sms-tree-backend-raimoethedev.koyeb.app/panel （注：文档自带测试功能）
