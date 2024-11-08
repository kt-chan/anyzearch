const axios = require('axios');
const fs = require('fs');
const HttpsProxyAgent = require("https-proxy-agent");
const { NativeEmbedder } = require("../../EmbeddingEngines/native");
const {
  handleDefaultStreamResponseV2,
} = require("../../helpers/chat/responses");
const { toValidNumber } = require("../../http");

class GenericOpenAiLLM {
  constructor(embedder = null, modelPreference = null) {
    const { OpenAI: OpenAIApi } = require("openai");
    if (!process.env.GENERIC_OPEN_AI_BASE_PATH)
      throw new Error(
        "GenericOpenAI must have a valid base path to use for the api."
      );

    this.basePath = process.env.GENERIC_OPEN_AI_BASE_PATH;
    let httpsAgent;

    //@DEBUG @PROXY - (C)ktchan - Setup HttpPorxy for firewall
    console.log('@Debug GenericOpenAiLLM .... 1 / basePath: ' + this.basePath);
    let http_proxy = process.env.HTTP_PROXY || process.env.http_proxy;

    if (!!http_proxy) {
      console.log('@Debug GenericOpenAiLLM .... 2 / HTTP_PROXY: ' + http_proxy);
      let proxy = new URL(http_proxy);
      if (process.env.NODE_EXTRA_CA_CERTS) {
        try {
          let ca = fs.readFileSync(process.env.NODE_EXTRA_CA_CERTS);
          // 代理配置对象
          const proxyConfig = {
            host: proxy.hostname, // 代理服务器的主机名
            port: proxy.port, // 代理服务器的端口号
            ca: ca // 读取的CA证书
          };
          httpsAgent = new HttpsProxyAgent(proxyConfig);
        } catch (err) {
          console.error('Error reading CA certificate file:', err);
          // 处理错误，例如设置默认的 httpsAgent 或者退出
        }
      } else {
        // 代理配置对象，如果不需要额外的CA证书
        const proxyConfig = {
          host: proxy.hostname, // 代理服务器的主机名
          port: proxy.port // 代理服务器的端口号
        };
        httpsAgent = new HttpsProxyAgent(proxyConfig);
      }
    } else{
      console.log('@Debug GenericOpenAiLLM .... 2 without Proxy set.');
    }

    // 创建 OpenAIApi 实例
    this.openai = new OpenAIApi({
      baseURL: this.basePath,
      apiKey: process.env.GENERIC_OPEN_AI_API_KEY ?? null,
      httpAgent: httpsAgent, // 注意这里应该是 httpAgent
    });

    this.model =
      modelPreference ?? process.env.GENERIC_OPEN_AI_MODEL_PREF ?? null;
    this.maxTokens = process.env.GENERIC_OPEN_AI_MAX_TOKENS
      ? toValidNumber(process.env.GENERIC_OPEN_AI_MAX_TOKENS, 1024)
      : 1024;
    if (!this.model)
      throw new Error("GenericOpenAI must have a valid model set.");
    this.limits = {
      history: this.promptWindowLimit() * 0.15,
      system: this.promptWindowLimit() * 0.15,
      user: this.promptWindowLimit() * 0.7,
    };

    this.embedder = embedder ?? new NativeEmbedder();
    this.defaultTemp = 0.7;
    this.log(`Inference API: ${this.basePath} Model: ${this.model}`);
  }

  log(text, ...args) {
    console.log(`\x1b[36m[${this.constructor.name}]\x1b[0m ${text}`, ...args);
  }

  #appendContext(contextTexts = []) {
    if (!contextTexts || !contextTexts.length) return "";
    return (
      "\nContext:\n" +
      contextTexts
        .map((text, i) => {
          return `[CONTEXT ${i}]:\n${text}\n[END CONTEXT ${i}]\n\n`;
        })
        .join("")
    );
  }

  streamingEnabled() {
    return "streamGetChatCompletion" in this;
  }

  // Ensure the user set a value for the token limit
  // and if undefined - assume 4096 window.
  promptWindowLimit() {
    const limit = process.env.GENERIC_OPEN_AI_MODEL_TOKEN_LIMIT || 4096;
    if (!limit || isNaN(Number(limit)))
      throw new Error("No token context limit was set.");
    return Number(limit);
  }

  // Short circuit since we have no idea if the model is valid or not
  // in pre-flight for generic endpoints
  isValidChatCompletionModel(_modelName = "") {
    return true;
  }

  constructPrompt({
    systemPrompt = "",
    contextTexts = [],
    chatHistory = [],
    userPrompt = "",
  }) {
    const prompt = {
      role: "system",
      content: `${systemPrompt}${this.#appendContext(contextTexts)}`,
    };
    return [prompt, ...chatHistory, { role: "user", content: userPrompt }];
  }

  async getChatCompletion(messages = null, { temperature = 0.7 }) {
    const result = await this.openai.chat.completions
      .create({
        model: this.model,
        messages,
        temperature,
        max_tokens: this.maxTokens,
      })
      .catch((e) => {
        throw new Error(e.message);
      });

    if (!result.hasOwnProperty("choices") || result.choices.length === 0)
      return null;
    return result.choices[0].message.content;
  }

  async streamGetChatCompletion(messages = null, { temperature = 0.7 }) {
    const streamRequest = await this.openai.chat.completions.create({
      model: this.model,
      stream: true,
      messages,
      temperature,
      max_tokens: this.maxTokens,
    });
    return streamRequest;
  }

  handleStream(response, stream, responseProps) {
    return handleDefaultStreamResponseV2(response, stream, responseProps);
  }

  // Simple wrapper for dynamic embedder & normalize interface for all LLM implementations
  async embedTextInput(textInput) {
    return await this.embedder.embedTextInput(textInput);
  }
  async embedChunks(textChunks = []) {
    return await this.embedder.embedChunks(textChunks);
  }

  async compressMessages(promptArgs = {}, rawHistory = []) {
    const { messageArrayCompressor } = require("../../helpers/chat");
    const messageArray = this.constructPrompt(promptArgs);
    return await messageArrayCompressor(this, messageArray, rawHistory);
  }
}

module.exports = {
  GenericOpenAiLLM,
};
