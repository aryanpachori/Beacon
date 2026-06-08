import * as React from 'react'

export async function renderEmail(element: React.ReactElement): Promise<string> {
  const ReactDOMServer = (await import('react-dom/server')).default
  return ReactDOMServer.renderToString(element)
}
