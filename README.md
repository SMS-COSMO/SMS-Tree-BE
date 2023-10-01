## 本地开发

### 1. 安装依赖
```
pnpm i
```
### 2. 配置环境变量
1. 在根目录下创建 `.env` 文件
2. 根据 `.env.example` 中的项，在刚才创建的 `.env` 中填入相应的环境变量
#### 2.1 数据库的配置
 - TODO：等迁移至sqlite后更新
### 3. 启动开发服务器
```
pnpm dev
```
## 可参考的资源

-   drizzle-orm 文档： https://orm.drizzle.team/docs/quick-start
-   trpc 文档： https://trpc.io/docs/
-   测试服务器URL： https://sms-tree-be.onrender.com/trpc
-   测试服务器生成的文档： https://sms-tree-be.onrender.com/panel （此文档带有在线调试功能！！）
