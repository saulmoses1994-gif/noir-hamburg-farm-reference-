'use client'

import { useCallback, useEffect, useState } from 'react'

// Interactive photo gallery with lightbox. Renders:
//   - A large cover (index 0) + a 3-col thumbnail grid for the rest
//   - A full-screen lightbox with prev/next arrows, counter, close button
//   - Keyboard navigation: Esc closes, ArrowLeft/Right cycle
//   - Touch swipe (horizontal drag > 40px) on mobile
//   - Body scroll lock while lightbox is open
//   - No dependencies — pure React + Tailwind
export default function ModelGallery({ images, alt, counterLabel = 'photo' }) {
  const list = (images || []).filter(Boolean)
  const [openIndex, setOpenIndex] = useState(null)
  const [touchStartX, setTouchStartX] = useState(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const prev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + list.length) % list.length))
  }, [list.length])
  const next = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % list.length))
  }, [list.length])

  useEffect(() => {
    if (openIndex === null) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [openIndex, close, prev, next])

  const onTouchStart = (e) => setTouchStartX(e.touches[0]?.clientX ?? null)
  const onTouchEnd = (e) => {
    if (touchStartX === null) return
    const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX
    if (Math.abs(dx) > 40) {
      if (dx > 0) prev()
      else next()
    }
    setTouchStartX(null)
  }

  if (list.length === 0) return null

  return (
    <>
      {/* Cover */}
      <button
        type="button"
        onClick={() => setOpenIndex(0)}
        className="block w-full aspect-[3/4] overflow-hidden bg-[#F2EAE4] mb-3 group"
        aria-label={`${alt} — open photo 1 of ${list.length}`}
        data-testid="gallery-cover"
      >
        <img
          src={list[0]}
          alt={alt}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
      </button>

      {/* Thumbnail grid */}
      {list.length > 1 && (
        <div className="grid grid-cols-3 gap-3" data-testid="gallery-thumbs">
          {list.slice(1).map((src, i) => (
            <button
              type="button"
              key={`${src}-${i}`}
              onClick={() => setOpenIndex(i + 1)}
              className="aspect-[3/4] overflow-hidden bg-[#F2EAE4] group"
              aria-label={`${alt} — open photo ${i + 2} of ${list.length}`}
              data-testid={`gallery-thumb-${i + 1}`}
            >
              <img
                src={src}
                alt={`${alt} ${i + 2}`}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          data-testid="gallery-lightbox"
        >
          {/* Close */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); close() }}
            className="absolute top-4 right-4 w-11 h-11 inline-flex items-center justify-center text-white text-xl border border-white/25 rounded-full hover:bg-white/10"
            aria-label="Close"
            data-testid="gallery-close"
          >
            ✕
          </button>

          {/* Prev / Next */}
          {list.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 inline-flex items-center justify-center text-white text-3xl border border-white/25 rounded-full hover:bg-white/10"
                aria-label="Previous"
                data-testid="gallery-prev"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 inline-flex items-center justify-center text-white text-3xl border border-white/25 rounded-full hover:bg-white/10"
                aria-label="Next"
                data-testid="gallery-next"
              >
                ›
              </button>
            </>
          )}

          {/* Image (stop propagation so tapping the photo doesn't close) */}
          <img
            src={list[openIndex]}
            alt={`${alt} ${openIndex + 1} / ${list.length}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[86vh] object-contain select-none"
            draggable={false}
          />

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-[11px] font-mono tracking-widest uppercase select-none">
            {openIndex + 1} / {list.length} {counterLabel}
          </div>
        </div>
      )}
    </>
  )
}
