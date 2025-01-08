## Build Guide ##
### Go to build directory
```bash
cd ./build/docker
```

### Set permission to execute
```bash
sudo chmod u+x ./*.sh
```

### Make Change on the .env file
```bash
vi ./build/docker/.env.example
```

### Build the image
```bash
sudo ./build.sh
```


***

## Deploy Guide ## 
### Go to run directory
```bash
cd ./run
```

### update  ./.env.sample | 刷新 ./.env.sample 参数
```bash
vi /.env.sampl
```

###  copy ./.env.smaple to ./.env | 然后复制 ./.env.smaple 到 ./.env
```bash
copy -f ./.env.smaple ./.env 
```

###  run the program ./start-demo.sh | 执行程序 ./start-demo.sh
```bash
./start-demo.sh
```


### you can now access your app. at http://[yourhost.local]/
### 你可以用浏览器登入应用 at http://[yourhost.local]/
```bash
http://[yourhost.local]
```

***

## Feature ##

AnyZearch Feature Specification



1.1	Large Language Model Features Specification:

i.	Support local hosted of LLM providers for chatting and document analysis.

ii.	Support remote LLM providers for chatting and document analysis;



1.2	Retrieval Augmented Generation Features Specification:

1.2.1	Vector Database 

i.	Support Multiple Vector Databases Providers, including LanceDB, Chroma, and Milvus; 

ii.	Support local embedded deployment and remote connection to vector database;

1.2.2	Embedding models

i.	Support Multiple Embedding models, including models from huggingface, ollama and local deployed, 

ii. Support embedding models that turn text into vectors, which can be stored and searched in a vector database - which is the foundation of RAG.

1.2.3	Content Management

i.	Support Content Upload which permits upload various type of documents including pdf, text, word, html. And then above to load selected content items into vector database for vector search;

ii.	Support Web Crawler which permits user specify a webpage and with parameters on depth which is the number of child-links that the worker should follow and the pages which is the maximum number of links to scrape.

iii.	Support Content Pinning which permits the whole document to be included in the reference content for llm, therefore you will get full-text comprehension and far better answers at the expense of speed and cost.



1.3	System Features Specification:

i.	Support multi user usage with role based (System Admin, Workspace Admin, General User) access control

ii.	Support user activity logging, including login, chat event;


### 功能 ###

AnyZearch 功能规格说明


1.1 大型语言模型功能规格说明：

i. 支持本地托管的大型语言模型提供商，用于聊天和文档分析。

ii. 支持远程大型语言模型提供商，用于聊天和文档分析；


1.2 检索增强生成功能规格说明：

1.2.1 向量数据库

i. 支持多个向量数据库提供商，包括 LanceDB、Chroma 和 Milvus；

ii. 支持本地嵌入式部署和远程连接到向量数据库；

1.2.2 嵌入模型

i. 支持多个嵌入模型，包括来自 huggingface、ollama 和本地部署的模型;

ii. 这些模型将文本转换为向量，可以存储在向量数据库中进行向量搜索 - 这是 RAG 的基础。

1.2.3 内容管理

i. 支持内容上传，允许上传包括 pdf、文本、word、html 在内的各种类型的文档。然后选择内容项加载到向量数据库进行向量搜索；

ii. 支持网页爬虫，允许用户指定网页，并设置深度参数，即工作者应跟踪的子链接数量，以及页面参数，即要抓取的最大链接数。

iii. 支持内容固定，允许整个文档被包含在 llm 的参考内容中，因此你将获得全文理解，并且以牺牲速度和成本为代价获得更好的答案。


1.3 系统功能规格说明：

i. 支持多用户使用，具有基于角色的（系统管理员、工作区管理员、普通用户）访问控制

ii. 支持用户活动记录，包括登录、聊天事件；


