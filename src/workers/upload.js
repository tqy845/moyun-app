self.onmessage = async function (event) {
  const { chunk, chunkName, url, formData, index } = event.data
  try {
    const _formData = new FormData()
    for (const key in formData) {
      if (Object.hasOwn(formData, key)) {
        _formData.append(key, formData[key])
      }
    }
    _formData.append('file', chunk, chunkName)
    const config = {
      url,
      method: 'POST',
      body: _formData
    }

    const response = await fetch(config.url, config)

    if (!response.ok) {
      new Error('上传数据分片失败')
    }

    self.postMessage({ success: true, index })
  } catch (e) {
    self.postMessage({ success: false, index, error: e.message })
  }
}
