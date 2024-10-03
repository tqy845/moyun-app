self.onmessage = async (event) => {
  const { url, index } = event.data

  const downloadWithProgress = async (url) => {
    const response = await fetch(url)
    return response.arrayBuffer()
  }

  const data = await downloadWithProgress(url)
  self.postMessage({ type: 'complete', data, index })
}
