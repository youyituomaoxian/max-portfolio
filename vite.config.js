import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

// 图片自动压缩配置
const IMAGE_MAX_PX = 1920        // 长边最大像素
const JPEG_QUALITY = 82           // JPEG / WebP 质量
const COMPRESS_MIME = ['image/jpeg', 'image/png', 'image/webp']

/**
 * 对上传的图片 buffer 进行压缩（resize + 格式优化）
 * 非图片类型原样返回；压缩失败回退为原图
 */
async function compressImage(buffer, mimeType) {
  if (!COMPRESS_MIME.some((t) => mimeType.startsWith(t))) return buffer

  try {
    let pipeline = sharp(buffer).resize(IMAGE_MAX_PX, IMAGE_MAX_PX, {
      fit: 'inside',
      withoutEnlargement: true,
    })

    if (mimeType === 'image/png') {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true })
    } else if (mimeType === 'image/webp') {
      pipeline = pipeline.webp({ quality: JPEG_QUALITY })
    } else {
      // JPEG 或未知 → mozjpeg
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    }

    return await pipeline.toBuffer()
  } catch {
    // 压缩失败（如损坏图片），退回原图
    return buffer
  }
}

// 本地后台（admin）上传中间件：选择文件 → 压缩 → 写入 public/
// 仅 dev server 生效（admin 是本地工具，不进入生产构建）
function mediaUploadPlugin() {
  return {
    name: 'media-upload',
    configureServer(server) {
      server.middlewares.use('/__media-upload', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        // 收集请求体
        const chunks = []
        let total = 0
        const MAX = 60 * 1024 * 1024 // 60MB 上限
        try {
          for await (const chunk of req) {
            total += chunk.length
            if (total > MAX) { req.destroy(); return }
            chunks.push(chunk)
          }
        } catch {
          return
        }
        const body = Buffer.concat(chunks).toString('utf8')

        try {
          const { dir, name, dataUrl } = JSON.parse(body)
          if (!dir || !name || !dataUrl || typeof dir !== 'string' || typeof name !== 'string') {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: 'invalid params' }))
            return
          }

          // 安全检查：仅允许 projects / images / videos 根目录
          const parts = dir.split('/').filter(Boolean)
          const allowed = ['projects', 'images', 'videos']
          if (!allowed.includes(parts[0]) || parts.some((p) => p.includes('..') || p.startsWith('.'))) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: 'dir not allowed' }))
            return
          }
          if (name.includes('..') || name.includes('/') || name.startsWith('.')) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: 'invalid name' }))
            return
          }

          const m = /^data:([\w/\-.]+);base64,(.+)$/.exec(dataUrl)
          if (!m) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: 'bad dataUrl' }))
            return
          }

          const mimeType = m[1].toLowerCase()
          const origSize = Math.round(m[2].length * 0.75) // Base64 → 原始字节估算
          let buffer = Buffer.from(m[2], 'base64')

          // === 图片自动压缩 ===
          const compressed = await compressImage(buffer, mimeType)
          if (compressed !== buffer) {
            const kbBefore = (origSize / 1024).toFixed(0)
            const kbAfter = (compressed.length / 1024).toFixed(0)
            const pct = ((1 - compressed.length / origSize) * 100).toFixed(0)
            console.log(`\n  📷 [压缩] ${name}  ${kbBefore}KB → ${kbAfter}KB  (${pct}%)\n`)
            buffer = compressed
          }

          // 写入磁盘
          const targetDir = path.resolve(process.cwd(), 'public', ...parts)
          fs.mkdirSync(targetDir, { recursive: true })
          fs.writeFileSync(path.join(targetDir, name), buffer)

          const relPath = '/' + parts.join('/') + '/' + name
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true, path: relPath }))
        } catch (e) {
          console.error('[media-upload]', e)
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, error: String(e) }))
        }
      })
    }
  }
}

export default defineConfig({
  appType: 'mpa',
  plugins: [react(), mediaUploadPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5175,
    watch: {
      usePolling: true,
      interval: 500,
      ignored: ['!**/node_modules/**', '!**/dist/**']
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  }
})
