const { v4 } = require("uuid");
const {
  PuppeteerWebBaseLoader,
} = require("langchain/document_loaders/web/puppeteer");
const { default: slugify } = require("slugify");
const { parse } = require("node-html-parser");
const { writeToSourceDocuments, writeToServerDocuments } = require("../../files");
const { tokenizeString } = require("../../tokenizer");
const path = require("path");
const fs = require("fs");

async function discoverLinks(startUrl, maxDepth = 1, maxLinks = 20) {
  const baseUrl = new URL(startUrl);
  const discoveredLinks = new Set([startUrl]);
  let queue = [[startUrl, 0]]; // [url, currentDepth]
  const scrapedUrls = new Set();

  for (let currentDepth = 0; currentDepth < maxDepth; currentDepth++) {
    const levelSize = queue.length;
    const nextQueue = [];

    for (let i = 0; i < levelSize && discoveredLinks.size < maxLinks; i++) {
      const [currentUrl, urlDepth] = queue[i];

      if (!scrapedUrls.has(currentUrl)) {
        scrapedUrls.add(currentUrl);
        const newLinks = await getPageLinks(currentUrl, baseUrl);

        for (const link of newLinks) {
          if (!discoveredLinks.has(link) && discoveredLinks.size < maxLinks) {
            discoveredLinks.add(link);
            if (urlDepth + 1 < maxDepth) {
              nextQueue.push([link, urlDepth + 1]);
            }
          }
        }
      }
    }

    queue = nextQueue;
    if (queue.length === 0 || discoveredLinks.size >= maxLinks) break;
  }

  return Array.from(discoveredLinks);
}

async function getPageLinks(url, baseUrl) {
  try {
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: { headless: "new" },
      gotoOptions: { waitUntil: "networkidle2" },
    });
    const docs = await loader.load();
    const html = docs[0].pageContent;
    const links = extractLinks(html, baseUrl);
    return links;
  } catch (error) {
    console.error(`Failed to get page links from ${url}.`, error);
    return [];
  }
}

function extractLinks(html, baseUrl) {
  const root = parse(html);
  const links = root.querySelectorAll("a");
  const extractedLinks = new Set();

  for (const link of links) {
    const href = link.getAttribute("href");
    if (href) {
      const absoluteUrl = new URL(href, baseUrl.href).href;
      if (
        absoluteUrl.startsWith(
          baseUrl.origin + baseUrl.pathname.split("/").slice(0, -1).join("/")
        )
      ) {
        extractedLinks.add(absoluteUrl);
      }
    }
  }

  return Array.from(extractedLinks);
}

async function bulkScrapePages(links, outFolderPath) {
  const scrapedData = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    console.log(`Scraping ${i + 1}/${links.length}: ${link}`);

    try {
      const loader = new PuppeteerWebBaseLoader(link, {
        launchOptions: { headless: "new" },
        gotoOptions: { waitUntil: "networkidle2", timeout: 100000 },
        async evaluate(page, browser) {
          const result = await page.evaluate(() => {
            return JSON.stringify({
              text: document.body.innerText,
              html: document.body.innerHTML,
            });
          });
          await browser.close();
          return result;
        },
      });

      const docs = await loader.load();
      const content = JSON.parse(docs[0].pageContent);
      const textContent = content.text;
      const htmlContent = content.html;

      if (!content.text.length) {
        console.warn(`Empty content for ${link}. Skipping.`);
        continue;
      }

      const url = new URL(link);
      const decodedPathname = decodeURIComponent(url.pathname);
      const filename = `${url.hostname}${decodedPathname.replace(/\//g, "_")}`;

      const data = {
        id: v4(),
        url: "link://" + slugify(filename) + ".html",
        title: slugify(filename) + ".html",
        docAuthor: "no author found",
        description: "No description found.",
        docSource: "URL link uploaded by the user.",
        chunkSource: `link://${link}`,
        published: new Date().toLocaleString(),
        wordCount: textContent.split(" ").length,
        pageContent: textContent,
        htmlContent: htmlContent,
        token_count_estimate: tokenizeString(textContent).length,
      };

      //@ktchan @webScraper
      let document = writeToSourceDocuments(data, data.title, null, outFolderPath);
      document = writeToServerDocuments(document, document.title, ".json", outFolderPath);
      scrapedData.push(document);
      console.log(`Successfully scraped ${link}.`);

    } catch (error) {
      console.error(`Failed to scrape ${link}.`, error);
    }
  }

  return scrapedData;
}

async function websiteScraper(startUrl, depth = 1, maxLinks = 20) {
  const websiteName = new URL(startUrl).hostname;
  const outFolder = slugify(
    `${slugify(websiteName)}-${v4().slice(0, 4)}`
  ).toLowerCase();

  console.log("Discovering links...");
  const linksToScrape = await discoverLinks(startUrl, depth, maxLinks);
  console.log(`Found ${linksToScrape.length} links to scrape.`);

  console.log("Starting bulk scraping...");
  const scrapedData = await bulkScrapePages(linksToScrape, outFolder);
  console.log(`Scraped ${scrapedData.length} pages.`);

  return scrapedData;
}

module.exports = websiteScraper;
