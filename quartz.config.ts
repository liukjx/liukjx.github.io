import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "维岳",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: "liukjx.github.io",
    ignorePatterns: ["private", "_templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      typography: {
        header: "Schibsted Grotesk",
        body: "Roboto",
        code: "Fira Code",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      // ABC记谱法插件
      createAbcNotationPlugin(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

// ABC记谱法插件工厂函数
function createAbcNotationPlugin() {
  const escapeHtml = (unsafe) => unsafe
    .replace(/\&/g, "&amp;")
    .replace(/\</g, "&lt;")
    .replace(/\>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\'/g, "&#039;")

  const processNode = (node) => {
    if (node.type === 'code' && node.lang === 'abc') {
      node.type = 'html'
      node.value = `<div class="abc-notation-render" data-abc="${escapeHtml(node.value)}"></div>`
      delete node.lang
    }
    
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        processNode(node.children[i])
      }
    }
  }

  return {
    name: "AbcNotation",
    markdownPlugins() {
      return [
        () => (tree, _file) => processNode(tree),
      ]
    },
    externalResources() {
      return {
        css: [],
        js: [
          {
            src: "https://cdn.jsdelivr.net/npm/abcjs@6.2.2/dist/abcjs-basic-min.js",
            loadTime: "afterDOMReady",
            contentType: "external",
          },
          {
            loadTime: "afterDOMReady",
            contentType: "inline",
            script: `
              function renderAbcNotations() {
                const containers = document.querySelectorAll('.abc-notation-render');
                containers.forEach(container => {
                  const abcData = container.getAttribute('data-abc');
                  if (abcData && window.ABCJS) {
                    try {
                      container.innerHTML = '';
                      ABCJS.renderAbc(container, abcData, {
                        responsive: "resize",
                        staffwidth: 740
                      });
                    } catch (error) {
                      container.innerHTML = '<div class="abc-notation-error">乐谱渲染失败: ' + error.message + '</div>';
                    }
                  }
                });
              }

              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', renderAbcNotations);
              } else {
                renderAbcNotations();
              }

              if (window.navigation) {
                window.navigation.addEventListener('navigate', () => {
                  setTimeout(renderAbcNotations, 100);
                });
              }
            `,
          },
        ],
      }
    },
  } as any
}

export default config