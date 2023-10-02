## 本地开发

### 1. 安装依赖
```
pnpm i
```
### 2. 配置环境变量
1. 在根目录下创建 `.env` 文件
2. 根据 `.env.example` 中的项，在刚才创建的 `.env` 中填入相应的环境变量

> [!IMPORTANT]
> 在下文中，有关环境变量的设置一律在 `.env` 中进行，**不是**在 `.env.example` 中，请不要弄错！！

#### 2.1 数据库的配置
目前数据库支持两种模式：`remote` 和 `local` 。顾名思义，一种使用远程数据库，一种使用本地数据库。为了方便测试，下面介绍如何配置**本地**的测试数据库。

1. 根据 `.env.example` 中的注释可见，需要将环境变量中的**连接类型**设置为 `local`。
2. 在**根目录下**创建 `local.sqlite` 文件。
3. 运行 `pnpm drizzle-kit push:sqlite` ，这个命令的作用是初始化数据库内的表。
4. 配置到此就完成了！ 
### 3. 启动开发服务器
```
pnpm dev
```
### 4. 查看数据库内容
我们使用的 `drizzle orm` 贴心地准备了一个工具，可以用来查看和更改数据库内的数据，下面介绍使用教程。
1. 在终端运行命令 `pnpm studio`
2. 运行成功后会看到提示 `Drizzle Studio is up and running on http://0.0.0.0:4983` ，**请注意**，你需要在浏览器中打开`localhost:4983` 而**不是**`0.0.0.0:4983`。
3. 如果运行后现实的端口号与这里写的不同，别担心，只需要替换成你的端口号即可。
## 可参考的资源

-   drizzle-orm 文档： https://orm.drizzle.team/docs/quick-start
-   trpc 文档： https://trpc.io/docs/
-   测试服务器URL： https://sms-tree-be.onrender.com/trpc
-   测试服务器生成的文档： https://sms-tree-be.onrender.com/panel （此文档带有在线调试功能！！）
