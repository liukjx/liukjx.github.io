import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { QuartzPluginData } from "./quartz/plugins/vfile"
import { isFolderPath } from "./quartz/util/path"

const naturalCollator = new Intl.Collator("zh-CN", {
  numeric: true,
  sensitivity: "base",
})

function slugSortKey(file: QuartzPluginData): string {
  const slug = file.slug ?? ""
  const withoutIndex = slug.endsWith("/index") ? slug.slice(0, -"/index".length) : slug
  return withoutIndex.split("/").filter(Boolean).at(-1) ?? file.frontmatter?.title ?? ""
}

function byFolderThenSlug(f1: QuartzPluginData, f2: QuartzPluginData): number {
  const f1IsFolder = isFolderPath(f1.slug ?? "")
  const f2IsFolder = isFolderPath(f2.slug ?? "")
  if (f1IsFolder && !f2IsFolder) return -1
  if (!f1IsFolder && f2IsFolder) return 1

  return naturalCollator.compare(slugSortKey(f1), slugSortKey(f2))
}

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
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage({ sort: byFolderThenSlug }),
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

export default config
