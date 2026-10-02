import { useEffect, useRef, useState } from 'react'

const MOBILE_BREAKPOINT = 767
const PRELOAD_CONCURRENCY = 3

function ScrollSequenceBackground() {
  const canvasRef = useRef(null)
  const [loadedCount, setLoadedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return undefined
    }

    let sequence = window.innerWidth <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop'
    let desiredFrameIndex = -1
    let displayedFrameIndex = -1
    let scrollUpdateId = 0
    let loadGeneration = 0
    let frameCache = new Map()
    let pendingImages = new Set()

    const getFrameCount = () => sequence === 'mobile' ? 68 : 82

    const drawFrame = (image) => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'

      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const drawWidth = image.naturalWidth * scale
      const drawHeight = image.naturalHeight * scale

      context.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      )
    }

    const drawDesiredFrame = () => {
      const image = frameCache.get(desiredFrameIndex)
      if (image && displayedFrameIndex !== desiredFrameIndex) {
        drawFrame(image)
        displayedFrameIndex = desiredFrameIndex
      }
    }

    const updateDesiredFrame = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0
        ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
        : 0
      const nextFrameIndex = Math.round(progress * (getFrameCount() - 1))

      if (nextFrameIndex === desiredFrameIndex) {
        return
      }

      desiredFrameIndex = nextFrameIndex
      drawDesiredFrame()
    }

    const handleScroll = () => {
      if (!scrollUpdateId) {
        scrollUpdateId = window.requestAnimationFrame(() => {
          scrollUpdateId = 0
          updateDesiredFrame()
        })
      }
    }

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.round(window.innerWidth * pixelRatio)
      const height = Math.round(window.innerHeight * pixelRatio)

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        const displayedImage = frameCache.get(displayedFrameIndex)
        if (displayedImage) {
          drawFrame(displayedImage)
        }
      }
    }

    const preloadFrames = () => {
      const generation = ++loadGeneration
      const frameCount = getFrameCount()
      const folder = sequence === 'mobile' ? 'frames-mobile-optimized' : 'frames-optimized'
      const prefix = sequence === 'mobile' ? 'mobile' : 'desktop'
      const queue = Array.from({ length: frameCount }, (_, index) => index)
      let loaded = 0
      let activeLoads = 0

      frameCache = new Map()
      pendingImages = new Set()
      displayedFrameIndex = -1
      setLoadedCount(0)
      setHasLoadError(false)
      setIsLoading(true)

      const pumpQueue = () => {
        while (
          generation === loadGeneration
          && activeLoads < PRELOAD_CONCURRENCY
          && queue.length
        ) {
          const frameIndex = queue.shift()
          const image = new Image()
          activeLoads += 1
          pendingImages.add(image)

          const finish = (success) => {
            if (generation !== loadGeneration) return

            image.onload = null
            image.onerror = null
            pendingImages.delete(image)
            activeLoads -= 1

            if (success) {
              frameCache.set(frameIndex, image)
              loaded += 1
              setLoadedCount(loaded)
              drawDesiredFrame()

              if (loaded === frameCount) {
                setIsLoading(false)
              }
            } else {
              setHasLoadError(true)
            }

            pumpQueue()
          }

          image.onload = () => {
            const decoded = typeof image.decode === 'function'
              ? image.decode().catch(() => undefined)
              : Promise.resolve()
            decoded.then(() => finish(image.naturalWidth > 0))
          }
          image.onerror = () => finish(false)
          image.src = `/${folder}/${prefix}-${String(frameIndex + 1).padStart(4, '0')}.webp`
        }
      }

      pumpQueue()
    }

    const handleResize = () => {
      const nextSequence = window.innerWidth <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop'

      resizeCanvas()
      if (nextSequence !== sequence) {
        pendingImages.forEach((image) => {
          image.onload = null
          image.onerror = null
          image.removeAttribute('src')
        })
        pendingImages.clear()
        frameCache.clear()
        sequence = nextSequence
        desiredFrameIndex = -1
        updateDesiredFrame()
        preloadFrames()
        return
      }

      updateDesiredFrame()
      drawDesiredFrame()
    }

    resizeCanvas()
    updateDesiredFrame()
    preloadFrames()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (scrollUpdateId) {
        window.cancelAnimationFrame(scrollUpdateId)
      }
      loadGeneration += 1
      pendingImages.forEach((image) => {
        image.onload = null
        image.onerror = null
        image.removeAttribute('src')
      })
      pendingImages.clear()
      frameCache.clear()
    }
  }, [])

  const frameCount = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT ? 68 : 82
  const progress = Math.round((loadedCount / frameCount) * 100)

  return (
    <>
      <canvas ref={canvasRef} className="global-scroll-background" aria-hidden="true" />
      {isLoading && (
        <div className="home-frame-loader" role="status" aria-live="polite">
          <div className="home-frame-loader-content">
            <img src="/logo.png" alt="" className="home-frame-loader-logo" />
            <p className="home-frame-loader-brand">KopiKita</p>
            <p className="home-frame-loader-message">
              {hasLoadError ? 'Gagal memuat animasi. Periksa koneksi Anda.' : 'Menyiapkan pengalaman KopiKita...'}
            </p>
            <div
              className="home-frame-loader-track"
              role="progressbar"
              aria-label="Memuat animasi latar Home"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={progress}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="home-frame-loader-progress">{progress}%</span>
          </div>
        </div>
      )}
    </>
  )
}

export default ScrollSequenceBackground