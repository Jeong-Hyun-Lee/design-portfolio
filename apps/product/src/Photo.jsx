import { useState } from 'react'

/**
 * Codex-made photo (webp + jpg) from public/images. While the file doesn't exist yet it shows
 * a labelled placeholder, so the layout can be reviewed before assets arrive.
 * Extra props (e.g. data-parallax-img) go to the <img>.
 */
export default function Photo({ name, alt, width, height, className = '', isEager = false, ...imgProps }) {
  const [isMissing, setIsMissing] = useState(false)
  const base = `${import.meta.env.BASE_URL}images/${name}`

  if (isMissing) {
    return (
      <div className={`photo-missing ${className}`} role="img" aria-label={alt}>
        <span>{name} · 에셋 준비 중</span>
      </div>
    )
  }
  return (
    <picture className={className}>
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        src={`${base}.jpg`}
        alt={alt}
        width={width}
        height={height}
        loading={isEager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setIsMissing(true)}
        {...imgProps}
      />
    </picture>
  )
}
