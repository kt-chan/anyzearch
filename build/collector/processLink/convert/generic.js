const { v4 } = require("uuid");
const {
  PuppeteerWebBaseLoader,
} = require("langchain/document_loaders/web/puppeteer");
const { writeToSourceDocuments, writeToServerDocuments } = require("../../utils/files");
const { tokenizeString } = require("../../utils/tokenizer");
const { default: slugify } = require("slugify");

async function scrapeGenericUrl(link, textOnly = false) {
  console.log(`-- Working URL ${link} --`);
  const content = await getPageContent(link);

  if (!content.length) {
    console.error(`Resulting URL content was empty at ${link}.`);
    return {
      success: false,
      reason: `No URL content found at ${link}.`,
      documents: [],
    };
  }

  if (textOnly) {
    return {
      success: true,
      content,
    };
  }

  const url = new URL(link);
  const filename = (url.host + "-" + url.pathname).replace(".", "_");

  const data = {
    id: v4(),
    url: "link://" + slugify(filename) + ".html",
    title: slugify(filename) + ".html",
    docAuthor: "no author found",
    description: "No description found.",
    docSource: "URL link uploaded by the user.",
    chunkSource: `link://${link}`,
    published: new Date().toLocaleString(),
    wordCount: content.split(" ").length,
    pageContent: content,
    token_count_estimate: tokenizeString(content).length,
  };

  let document;
  try {
    //@DEBUG @ktchan @webScraper
    let document = writeToSourceDocuments(data, data.title, null, outFolderPath);
    document = writeToServerDocuments(document, document.title, ".json", outFolderPath);

    console.log(`[SUCCESS]: URL ${link} converted & ready for embedding.\n`);
  } catch (error) {
    console.error("Could not save file!", error);
    return { success: false, reason: error.message, documents: [] };
  }

  return { success: true, reason: null, documents: [document] };
}

async function getPageContent(link) {
  try {
    let pageContents = [];
    let loader;
    let http_proxy = process.env.HTTP_PROXY || process.env.http_proxy;

    if (!!http_proxy) {
      console.log('@Debug PuppeteerWebBaseLoader:bulkScrapePages .... 1 / HTTP_PROXY: ' + http_proxy);
      loader = new PuppeteerWebBaseLoader(link, {
        launchOptions: { headless: "new", args: [`--proxy-server=https=${http_proxy}`, '--no-sandbox'], ignoreHTTPSErrors: true },
        gotoOptions: { waitUntil: "networkidle0", timeout: 100000 },
        async evaluate(page, browser) {
          const result = await page.evaluate(() => document.body.innerText);
          await browser.close();
          return result;
        },
      })
    }
    else {
      console.log('@Debug PuppeteerWebBaseLoader:bulkScrapePages .... 2 / NO_PROXY');
      loader = new PuppeteerWebBaseLoader(link, {
        launchOptions: { headless: "new" },
        gotoOptions: { waitUntil: "networkidle0", timeout: 100000 },
        async evaluate(page, browser) {
          const result = await page.evaluate(() => document.body.innerText);
          await browser.close();
          return result;
        },
      });
    }

    const docs = await loader.load();

    for (const doc of docs) {
      pageContents.push(doc.pageContent);
    }

    return pageContents.join(" ");
  } catch (error) {
    console.error(
      "getPageContent failed to be fetched by puppeteer - falling back to fetch!",
      error
    );
  }

  try {
    const pageText = await fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "text/plain",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)",
      },
    }).then((res) => res.text());
    return pageText;
  } catch (error) {
    console.error("getPageContent failed to be fetched by any method.", error);
  }

  return null;
}

module.exports = {
  scrapeGenericUrl,
};
