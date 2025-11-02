import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Lightbox
 * Simple image preview component used by ChatContainer.
 * Props:
 * - images: array of image URLs
 * - startIndex: initial image index to show
 * - onClose: callback when the lightbox should be closed
 * - onNext/onPrev: optional callbacks used by parent to change image
 */
const Lightbox = ({ images = [], startIndex = 0, onClose, onNext, onPrev }) => {
    const [index, setIndex] = useState(startIndex || 0);
    // Keep index in valid bounds
    const idx = Math.max(0, Math.min(index || 0, images.length - 1));
    const src = images[idx];
    const startX = useRef(null);
    const containerRef = useRef(document.createElement('div'));

    // Sync local index when parent opens a different startIndex
    useEffect(() => {
        setIndex(startIndex || 0);
    }, [startIndex]);

    // Mount a portal container to body and handle keyboard navigation
    useEffect(() => {
        const el = containerRef.current;
        document.body.appendChild(el);
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
            if (e.key === 'ArrowRight') (onNext ? onNext() : setIndex(i => Math.min(images.length - 1, i + 1)));
            if (e.key === 'ArrowLeft') (onPrev ? onPrev() : setIndex(i => Math.max(0, i - 1)));
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            if (document.body.contains(el)) document.body.removeChild(el);
        };
    }, [onClose, onNext, onPrev, images.length]);

    if (!src) return null;

    const onTouchStart = (e) => {
        startX.current = e.touches?.[0]?.clientX ?? null;
    };

    const onTouchEnd = (e) => {
        const endX = e.changedTouches?.[0]?.clientX ?? null;
        if (startX.current == null || endX == null) return;
        const diff = endX - startX.current;
        const threshold = 50; // px
        if (diff > threshold) (onPrev ? onPrev() : setIndex(i => Math.max(0, i - 1)));
        else if (diff < -threshold) (onNext ? onNext() : setIndex(i => Math.min(images.length - 1, i + 1)));
        startX.current = null;
    };

    const content = (
        <div
            className='fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4'
            role='dialog'
            aria-modal='true'
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <button aria-label='Close' onClick={(e) => { e.stopPropagation(); onClose?.(); }} className='absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2'>
                ✕
            </button>

            {/* Prev */}
            <button aria-label='Previous' onClick={(e) => { e.stopPropagation(); (onPrev ? onPrev() : setIndex(i => Math.max(0, i - 1))); }} className='absolute left-4 md:left-8 text-white/90 p-2 rounded-full bg-black/30'>‹</button>

            <img src={src} alt={`image-${idx}`} className='max-w-full max-h-[90vh] rounded-md shadow-lg object-contain' onClick={(e) => e.stopPropagation()} />

            {/* Next */}
            <button aria-label='Next' onClick={(e) => { e.stopPropagation(); (onNext ? onNext() : setIndex(i => Math.min(images.length - 1, i + 1))); }} className='absolute right-4 md:right-8 text-white/90 p-2 rounded-full bg-black/30'>›</button>
        </div>
    );

    return createPortal(content, containerRef.current);
}

export default Lightbox
