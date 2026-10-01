import { useEffect, useRef } from 'react'

const MOBILE_BREAKPOINT = 767
const MAX_CACHED_FRAMES = 3

function ScrollSequenceBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return undefined
    }

    let sequence = window.innerWidth <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop'
    let desiredFrameIndex = -1
    let displayedFrameIndex = -1
    let pendingImage = null
    let scrollUpdateId = 0
    const frameCache = new Map()

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

    const cacheFrame = (index, image) => {
      frameCache.delete(index)
      frameCache.set(index, image)

      while (frameCache.size > MAX_CACHED_FRAMES) {
        const oldestAvailable = [...frameCache.keys()].find((key) => key !== displayedFrameIndex)
        if (oldestAvailable === undefined) {
          break
        }
        frameCache.delete(oldestAvailable)
      }
    }

    const loadDesiredFrame = () => {
      if (desiredFrameIndex < 0) {
        return
      }

      const cachedImage = frameCache.get(desiredFrameIndex)
      if (cachedImage) {
        frameCache.delete(desiredFrameIndex)
        frameCache.set(desiredFrameIndex, cachedImage)
        if (displayedFrameIndex !== desiredFrameIndex) {
          drawFrame(cachedImage)
          displayedFrameIndex = desiredFrameIndex
        }
        return
      }

      if (pendingImage) {
        return
      }

      const frameIndex = desiredFrameIndex
      const image = new Image()
      pendingImage = image

      image.onload = () => {
        if (pendingImage !== image) {
          return
        }

        pendingImage = null
        image.onload = null
        image.onerror = null
        cacheFrame(frameIndex, image)

        if (frameIndex === desiredFrameIndex) {
          drawFrame(image)
          displayedFrameIndex = frameIndex
        }

        loadDesiredFrame()
      }

      image.onerror = () => {
        if (pendingImage !== image) {
          return
        }

        pendingImage = null
        image.onload = null
        image.onerror = null

        if (frameIndex !== desiredFrameIndex) {
          loadDesiredFrame()
        }
      }

      const prefix = sequence === 'mobile' ? 'mobile' : 'desktop'
      const folder = sequence === 'mobile' ? 'frames-mobile' : 'frames'
      image.src = `/${folder}/${prefix}-${String(frameIndex + 1).padStart(4, '0')}.webp`
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
      loadDesiredFrame()
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

    const handleResize = () => {
      const nextSequence = window.innerWidth <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop'

      if (nextSequence !== sequence) {
        sequence = nextSequence
        frameCache.clear()
        displayedFrameIndex = -1

        if (pendingImage) {
          pendingImage.onload = null
          pendingImage.onerror = null
          pendingImage.removeAttribute('src')
          pendingImage = null
        }

        desiredFrameIndex = -1
      }

      resizeCanvas()
      updateDesiredFrame()
    }

    resizeCanvas()
    updateDesiredFrame()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (scrollUpdateId) {
        window.cancelAnimationFrame(scrollUpdateId)
      }
      if (pendingImage) {
        pendingImage.onload = null
        pendingImage.onerror = null
        pendingImage.removeAttribute('src')
      }
      frameCache.clear()
    }
  }, [])

  return <canvas ref={canvasRef} className="global-scroll-background" aria-hidden="true" />
}

export default ScrollSequenceBackground