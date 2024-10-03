import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { download as tauriDownload } from '@tauri-apps/plugin-upload'
import SparkMD5 from 'spark-md5'

const chunkSize = 5 * 1024 * 1024 // 5MB

function download(
  url: string,
  savePath: string,
  progress: ({ progress, total }: { progress: number; total: number }) => void
) {
  return tauriDownload(url, savePath, progress)
}

function createChunk(file: File, size = chunkSize) {
  const fileChunkList: Array<{ file: Blob }> = []
  let count = 0
  while (count < file.size) {
    fileChunkList.push({
      file: file.slice(count, count + size)
    })
    count += size
  }
  return fileChunkList
}

function calcMd5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobSlice = File.prototype.slice
    const fileReader = new FileReader()
    // 计算分片数
    const totalChunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
    const spark = new SparkMD5.ArrayBuffer()
    loadNext()
    fileReader.onload = function (e) {
      try {
        spark.append(e.target!.result)
      } catch (error) {
        reject('获取Md5错误：' + currentChunk)
      }
      if (currentChunk < totalChunks) {
        currentChunk++
        loadNext()
      } else {
        resolve(spark.end())
      }
    }
    fileReader.onerror = function () {
      reject('读取Md5失败，文件读取错误')
    }

    function loadNext() {
      const start = currentChunk * chunkSize
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize
      // 注意这里的 fileRaw
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
    }
  })
}

function upload(
  url: string,
  { data, method }: { data: FormData; method?: 'POST' | 'PUT' }
): Promise<{ fail: number; message: string }> {
  return new Promise((resolve, reject) => {
    tauriFetch(url, {
      method,
      body: data,
      connectTimeout: 60
    })
      .then((res) => {
        console.log(res)
        resolve({ fail: 0, message: '上传成功' })
      })
      .catch((err) => {
        if (!err.code) {
          resolve({ fail: 0, message: '上传成功' })
          return
        }
        console.log(err)
        reject({ fail: 0, message: err })
      })
  })
}

function uploadByFetch(
  url: string,
  {
    data,
    progress,
    method
  }: {
    data: FormData
    progress: ({ progress, total }: { progress: number; total: number }) => void
    method?: 'POST' | 'PUT'
  }
): Promise<{ fail: number; message: string }> {
  return new Promise((resolve, reject) => {
    const file = data.get('file')! as File
    const reader = file.stream().getReader()
    const totalSize = file.size
    window
      .fetch(url, {
        method,
        body: data
      })
      .then(async (response: Response) => {
        if (response.status === 200) {
          resolve({ fail: 0, message: '上传成功' })
          return
        }
        const error = await response
          .text()
          .then((str) => new window.DOMParser().parseFromString(str, 'text/xml'))
          .then((data) => data.querySelector('Code')?.textContent)
        console.error(error)
        reject({ fail: 0, message: error })
      })

    reader.read().then(function processChunk({ done, value }) {
      if (done) {
        return
      }
      progress({ progress: value.length, total: totalSize })
      return reader.read().then(processChunk)
    })
  })
}

const uploadUtils = {
  download,
  createChunk,
  calcMd5,
  upload,
  uploadByFetch
}

export default uploadUtils
