/**
 * Bytes of a GLB under the app's public/ folder.
 * http(s): plain fetch. file://: fetch is blocked, so it loads the `<path>.js` script that the
 * shared Vite config emits for every model listed in defineStaticSite({ models }).
 * @param {string} path e.g. 'models/lantern.glb'
 * @returns {Promise<ArrayBuffer>}
 */
export function loadGlb(path) {
  const url = `${import.meta.env.BASE_URL}${path}`
  if (location.protocol !== 'file:') {
    return fetch(url).then((res) => {
      if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
      return res.arrayBuffer()
    })
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${url}.js`
    script.onload = () => {
      const b64 = window.__glb?.[path]
      if (!b64) return reject(new Error(`${path}: not listed in defineStaticSite({ models })`))
      delete window.__glb[path]
      const bytes = Uint8Array.fromBase64?.(b64) ?? Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      resolve(bytes.buffer)
    }
    script.onerror = () => reject(new Error(`${path}: script failed to load`))
    document.head.append(script)
  })
}
