declare module "vfile" {
  interface DataMap {
    frontmatter?: Record<string, unknown>
  }
}

export type QuartzTransformerPlugin<Options = undefined> = (
  opts?: Options
) => QuartzTransformerPluginInstance

export interface QuartzTransformerPluginInstance {
  name: string
  externalResources?: () => {
    css?: Array<{ content: string }>
    js?: unknown[]
  }
  markdownPlugins?: () => unknown[]
  htmlPlugins?: () => unknown[]
}