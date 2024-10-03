self.onmessage = async function (event) {
  const { chunk, index } = event.data
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', await chunk.arrayBuffer())
    self.postMessage({ hashBuffer, index })
  } catch (e) {
    self.postMessage({ error: e.message, index })
  }
}
