# AnyZearch

> A full‑stack, multi‑modal RAG platform forked from [AnythingLLM v1.8.5](https://github.com/Mintplex-Labs/anything-llm/tree/v1.8.5),  
> with enhanced document parsing, VLM captioning, multi‑model index/search, and integrated provisioning via **anyadmin**.

---

## Highlights

- **Fork of AnythingLLM v1.8.5** – all core AnythingLLM features (multi‑user, workspaces, LLM/VectoDB providers, etc.) are preserved.<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-0' data-url='https://github.com/kt-chan/anyzearch' data-id='turn0fetch0'><span data-allow-html class='source-item-num' data-group-key='source-group-0' data-id='turn0fetch0' data-url='https://github.com/kt-chan/anyzearch'><span class='source-item-num-name' data-allow-html>github.com</span><span data-allow-html class='source-item-num-count'>+1</span></span></span>
- **Integrated with anyadmin** – centralized provisioning and management for enterprise deployments.
- **Preconfigured stack** – bundled vector DB, embedding models, reranker, LLM & VLM options with sensible defaults.
- **Enhanced document parsing with MinerU** – high‑quality PDF/document parsing into LLM‑ready markdown/JSON, improving complex document handling.<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-6' data-url='https://github.com/opendatalab/MinerU' data-id='turn4fetch0'><span data-allow-html class='source-item-num' data-group-key='source-group-6' data-id='turn4fetch0' data-url='https://github.com/opendatalab/MinerU'><span class='source-item-num-name' data-allow-html>github.com</span><span data-allow-html class='source-item-num-count'></span></span></span>
- **Multi‑modal enhancement with VLM caption** – vision‑language model (VLM) based captions for images, enabling richer multi‑modal retrieval and understanding.<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-7' data-url='https://openaccess.thecvf.com/content/ICCV2025/papers/Peng_ROVI_A_VLM-LLM_Re-Captioned_Dataset_for_Open-Vocabulary_Instance-Grounded_Text-to-Image_Generation_ICCV_2025_paper.pdf' data-id='turn3search0'><span data-allow-html class='source-item-num' data-group-key='source-group-7' data-id='turn3search0' data-url='https://openaccess.thecvf.com/content/ICCV2025/papers/Peng_ROVI_A_VLM-LLM_Re-Captioned_Dataset_for_Open-Vocabulary_Instance-Grounded_Text-to-Image_Generation_ICCV_2025_paper.pdf'><span class='source-item-num-name' data-allow-html>thecvf.com</span><span data-allow-html class='source-item-num-count'></span></span></span>
- **Multi‑model index & search** – improved indexing and retrieval across multiple models and modalities.

---

## What is AnyZearch?

AnyZearch is a full‑stack application that turns documents, web pages, and other content into context that LLMs can use during chat. It is a fork of [AnythingLLM v1.8.5](https://github.com/Mintplex-Labs/anything-llm), with several enhancements focused on:

- Enterprise‑ready provisioning and management via **anyadmin**.
- Stronger document parsing via **MinerU** for complex PDFs and multi‑format documents.<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-8' data-url='https://github.com/opendatalab/MinerU' data-id='turn4fetch0'><span data-allow-html class='source-item-num' data-group-key='source-group-8' data-id='turn4fetch0' data-url='https://github.com/opendatalab/MinerU'><span class='source-item-num-name' data-allow-html>github.com</span><span data-allow-html class='source-item-num-count'></span></span></span>
- Deeper multi‑modal support through **VLM captioning** for images and other visual content.
- More flexible **multi‑model indexing and search** across LLM/VLM/embedding/reranker models.

---

## Key Features

### Core (AnythingLLM‑inherited)

- **Workspaces** – containerized document sets; each workspace has its own vector index and context.
- **Multi‑user & RBAC** – multi‑user instances with role‑based access control (System Admin, Workspace Admin, General User).<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-9' data-url='https://github.com/kt-chan/anyzearch' data-id='turn0fetch0'><span data-allow-html class='source-item-num' data-group-key='source-group-9' data-id='turn0fetch0' data-url='https://github.com/kt-chan/anyzearch'><span class='source-item-num-name' data-allow-html>github.com</span><span data-allow-html class='source-item-num-count'></span></span></span>
- **Document ingestion** – upload PDFs, TXT, DOCX, HTML, etc.; web crawler with depth/page limits.<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-10' data-url='https://github.com/kt-chan/anyzearch' data-id='turn0fetch0'><span data-allow-html class='source-item-num' data-group-key='source-group-10' data-id='turn0fetch0' data-url='https://github.com/kt-chan/anyzearch'><span class='source-item-num-name' data-allow-html>github.com</span><span data-allow-html class='source-item-num-count'></span></span></span>
- **RAG pipeline** – vector database + embedding models + LLM chat with citations.
- **LLM provider support** – OpenAI, Azure OpenAI, Anthropic, Gemini, Ollama, LM Studio, LocalAI, etc.<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-11' data-url='https://github.com/Mintplex-Labs/anything-llm/blob/master/README.md' data-id='turn2fetch0'><span data-allow-html class='source-item-num' data-group-key='source-group-11' data-id='turn2fetch0' data-url='https://github.com/Mintplex-Labs/anything-llm/blob/master/README.md'><span class='source-item-num-name' data-allow-html>github.com</span><span data-allow-html class='source-item-num-count'></span></span></span>
- **Vector DB support** – LanceDB, Chroma, Milvus, Pinecone, Qdrant, Weaviate, etc.<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-1' data-url='https://docs.anythingllm.com/setup/vector-database-configuration/overview' data-id='turn1search6'><span data-allow-html class='source-item-num' data-group-key='source-group-1' data-id='turn1search6' data-url='https://docs.anythingllm.com/setup/vector-database-configuration/overview'><span class='source-item-num-name' data-allow-html>anythingllm.com</span><span data-allow-html class='source-item-num-count'>+1</span></span></span>
- **Embedding models** – AnythingLLM Native Embedder, OpenAI, Azure OpenAI, LocalAI, Ollama, LM Studio, Cohere, etc.<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-2' data-url='https://docs.useanything.com/features/embedding-models' data-id='turn1search5'><span data-allow-html class='source-item-num' data-group-key='source-group-2' data-id='turn1search5' data-url='https://docs.useanything.com/features/embedding-models'><span class='source-item-num-name' data-allow-html>useanything.com</span><span data-allow-html class='source-item-num-count'>+1</span></span></span>
- **Developer API** – full API for custom integrations.<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-12' data-url='https://github.com/Mintplex-Labs/anything-llm/blob/master/README.md' data-id='turn2fetch0'><span data-allow-html class='source-item-num' data-group-key='source-group-12' data-id='turn2fetch0' data-url='https://github.com/Mintplex-Labs/anything-llm/blob/master/README.md'><span class='source-item-num-name' data-allow-html>github.com</span><span data-allow-html class='source-item-num-count'></span></span></span>

### AnyZearch‑specific Enhancements

1. **Integration with anyadmin for provisioning & management**
   - Centralized instance provisioning and configuration.
   - Simplified deployment and lifecycle management in enterprise environments.

2. **Preconfigured vector DB, embedding models, reranker, LLM & VLM**
   - Out‑of‑the‑box profiles for:
     - Vector DB (e.g., LanceDB, Chroma, Milvus).
     - Embedding models (Hugging Face, Ollama, local endpoints).
     - Reranker models for improved retrieval quality.
     - LLM and VLM backends for text and multi‑modal tasks.

3. **Enhanced document parsing with MinerU**
   - Uses [MinerU](https://github.com/opendatalab/MinerU) to transform complex PDFs into LLM‑ready markdown/JSON.
   - Better handling of:
     - Multi‑language text.
     - Tables, formulas, and layouts.
     - Scanned documents via OCR.<span data-allow-html class='source-item source-aggregated' data-group-key='source-group-13' data-url='https://github.com/opendatalab/MinerU' data-id='turn4fetch0'><span data-allow-html class='source-item-num' data-group-key='source-group-13' data-id='turn4fetch0' data-url='https://github.com/opendatalab/MinerU'><span class='source-item-num-name' data-allow-html>github.com</span><span data-allow-html class='source-item-num-count'></span></span></span>
   - Improves chunking and representation for downstream RAG.

4. **Enhanced multi‑modal features with VLM caption**
   - Generates VLM‑based captions for images and visual documents.
   - Enables:
     - Cross‑modal retrieval (text ↔ image).
     - Richer context when answering questions about diagrams, charts, screenshots, etc.

5. **Enhanced multi‑model index & search**
   - Index content with multiple embedding models and VLM captions.
   - Flexible search strategies:
     - Single‑model vs multi‑model retrieval.
     - Reranking across models.
     - Unified search UI over heterogeneous vector spaces.

## Getting Started
### 1. Clone the repository
```bash
cd ~
git clone https://github.com/kt-chan/anyzearch.git
cd anyzearch
```
### 2. Use pre‑built Docker image
```bash
docker pull ktchanhk/anyzearch:0.0.1
```
### 3. Configure environment
```bash
cd ~/anyzearch/run
# Backend environment
cp -f ./.env.example ./.env
# Frontend environment
cp -f ./.env-fe.example ./.env-fe
# Edit .env and .env-fe to match your setup
vi ./.env
vi ./.env-fe
```
### 4. Start the demo stack
```bash
chmod u+x *.sh
./env.sh
./start-demo.sh
```
Then access the app at:
```text
http://<your-host>.local
```
---
## Build from Source
If you prefer to build the Docker image locally:
```bash
cd ~/anyzearch/build/docker
# Grant execution permission
sudo chmod u+x ./*.sh
# Edit .env.example as needed
vi ./build/docker/.env.example
# Build the image
sudo ./build.sh
```
---
## Supported Models & Providers
AnyZearch inherits AnythingLLM’s support for multiple providers and extends it with VLM and MinerU integrations.
### Large Language Models (LLMs)
Includes (but not limited to):
- OpenAI, Azure OpenAI, Anthropic, AWS Bedrock, Google Gemini, NVIDIA NIM.
- Hugging Face chat models, Ollama, LM Studio, LocalAI.
- Together AI, Fireworks AI, Perplexity, OpenRouter, DeepSeek, Mistral, Groq, Cohere, etc.
### Embedding Models
- AnythingLLM Native Embedder (default).
- OpenAI, Azure OpenAI, LocalAI, Ollama, LM Studio, Cohere, etc.
### Vector Databases
- LanceDB (default), Chroma, Milvus.
- PGVector, Pinecone, Qdrant, Weaviate, Astra DB, Zilliz, etc.
### Multi‑modal / VLM
- VLM models for image captioning and multi‑modal understanding (configurable via your provider of choice).
- Integrated with the indexing and retrieval pipeline to support multi‑modal search.
### Document Parsing
- MinerU for advanced PDF/document parsing:
  - High‑accuracy text extraction.
  - OCR, formula and table recognition.
  - Multi‑language support and hybrid parsing modes.
---
## Configuration Notes
- Environment variables are mainly configured via:
  - `./run/.env` – backend services (LLM, embedding, vectordb, auth, etc.).
  - `./run/.env-fe` – frontend settings (API endpoint, feature flags, etc.).
- For production deployments:
  - Ensure `DISABLE_TELEMETRY=true` if you want to disable telemetry (inherited from AnythingLLM).
  - Configure anyadmin integration according to your organization’s SSO and provisioning policies.
---
## Roadmap (Indicative)
- Tighter anyadmin integration for:
  - Instance templates and versioned configs.
  - Centralized secret and endpoint management.
- Expanded MinerU parsing options (batch, async, layout‑aware chunking).
- More VLM captioning strategies (region‑level captions, contrastive tuning).
- Advanced multi‑model search policies (fusion, re‑ranking, cross‑modal consistency).
---
## License
- This project is a fork of [AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) under the **MIT license**.
- AnyZearch’s own modifications and additions are released under the **GPL‑3.0 license** (see `LICENSE` in this repo).
---
## Acknowledgements
- [Mintplex Labs / AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) – the original full‑stack RAG application.
- [OpenDataLab / MinerU](https://github.com/opendatalab/MinerU) – advanced document parsing toolkit.
- All LLM, embedding, VLM, and vector database providers whose APIs and models power this stack.
```
