"use client"

import * as React from "react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "pixel-canvas": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "data-gap"?: number
          "data-speed"?: number
          "data-colors"?: string
          "data-variant"?: string
          "data-no-focus"?: string
        },
        HTMLElement
      >
    }
  }
}

let registered = false

function registerPixelCanvas() {
  if (typeof window === "undefined" || registered) return
  if (customElements.get("pixel-canvas")) { registered = true; return }
  registered = true

  // Dynamic import to avoid SSR issues
  const el = class extends HTMLElement {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D | null
    private pixels: any[] = []
    private anim: number | null = null
    private interval = 1000 / 60
    private prevTime = performance.now()
    private rm: boolean
    private init = false
    private ro: ResizeObserver | null = null
    private par: Element | null = null
    private enter = () => this.run("appear")
    private leave = () => this.run("disappear")

    constructor() {
      super()
      this.canvas = document.createElement("canvas")
      this.ctx = this.canvas.getContext("2d")
      this.rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const s = this.attachShadow({ mode: "open" })
      const st = document.createElement("style")
      st.textContent = `:host{display:grid;inline-size:100%;block-size:100%;overflow:hidden}`
      s.appendChild(st)
      s.appendChild(this.canvas)
    }

    get colors() { return this.dataset.colors?.split(",") || ["#f8fafc"] }
    get gap() { return Math.max(4, Math.min(50, Number(this.dataset.gap) || 5)) }
    get speed() { return this.rm ? 0 : Math.max(0, Math.min(100, Number(this.dataset.speed) || 35)) * 0.001 }

    connectedCallback() {
      if (this.init) return
      this.init = true
      this.par = this.parentElement
      requestAnimationFrame(() => {
        this.resize()
        this.ro = new ResizeObserver(() => requestAnimationFrame(() => this.resize()))
        this.ro.observe(this)
      })
      this.par?.addEventListener("mouseenter", this.enter)
      this.par?.addEventListener("mouseleave", this.leave)
    }

    disconnectedCallback() {
      this.init = false
      this.ro?.disconnect()
      this.par?.removeEventListener("mouseenter", this.enter)
      this.par?.removeEventListener("mouseleave", this.leave)
      if (this.anim) cancelAnimationFrame(this.anim)
      this.par = null
    }

    resize() {
      if (!this.ctx || !this.init) return
      const r = this.getBoundingClientRect()
      if (!r.width || !r.height) return
      const d = window.devicePixelRatio || 1
      this.canvas.width = r.width * d
      this.canvas.height = r.height * d
      this.canvas.style.width = `${r.width}px`
      this.canvas.style.height = `${r.height}px`
      this.ctx.setTransform(1, 0, 0, 1, 0, 0)
      this.ctx.scale(d, d)
      this.pixels = []
      const g = this.gap, sp = this.speed, c = this.colors, w = this.canvas.width, h = this.canvas.height
      for (let x = 0; x < w; x += g) {
        for (let y = 0; y < h; y += g) {
          const col = c[Math.floor(Math.random() * c.length)]
          const delay = this.rm ? 0 : Math.sqrt(x * x + (h - y) * (h - y))
          this.pixels.push({
            x, y, color: col,
            speed: (Math.random() * 0.8 + 0.1) * sp,
            size: 0, sizeStep: Math.random() * 0.4,
            minSize: 0.5, maxSize: Math.random() * 1.5 + 0.5,
            delay, counter: 0,
            counterStep: Math.random() * 4 + (w + h) * 0.01,
            isIdle: false, isReverse: false, isShimmer: false,
          })
        }
      }
    }

    run(mode: "appear" | "disappear") {
      if (this.anim) cancelAnimationFrame(this.anim)
      const go = () => {
        this.anim = requestAnimationFrame(go)
        const now = performance.now(), dt = now - this.prevTime
        if (dt < this.interval) return
        this.prevTime = now - (dt % this.interval)
        if (!this.ctx) return
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        let allDone = true
        for (const p of this.pixels) {
          if (mode === "appear") {
            p.isIdle = false
            if (p.counter <= p.delay) { p.counter += p.counterStep; allDone = false; continue }
            if (p.size >= p.maxSize) p.isShimmer = true
            if (p.isShimmer) {
              if (p.size >= p.maxSize) p.isReverse = true
              else if (p.size <= p.minSize) p.isReverse = false
              p.size += p.isReverse ? -p.speed : p.speed
            } else { p.size += p.sizeStep }
          } else {
            p.isShimmer = false; p.counter = 0
            if (p.size <= 0) { p.isIdle = true; continue }
            p.size -= 0.1
          }
          const o = 1 - p.size * 0.5
          this.ctx.fillStyle = p.color
          this.ctx.fillRect(p.x + o, p.y + o, p.size, p.size)
          allDone = false
        }
        if (allDone) { cancelAnimationFrame(this.anim!); this.anim = null }
      }
      go()
    }
  }

  customElements.define("pixel-canvas", el)
}

export interface PixelCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number
  speed?: number
  colors?: string[]
  variant?: "default" | "icon"
  noFocus?: boolean
}

const PixelCanvas = React.forwardRef<HTMLDivElement, PixelCanvasProps>(
  ({ gap, speed, colors, variant, noFocus, style, ...props }, ref) => {
    const [ready, setReady] = React.useState(false)

    React.useEffect(() => {
      registerPixelCanvas()
      setReady(true)
    }, [])

    if (!ready) return null

    return (
      <pixel-canvas
        ref={ref as any}
        data-gap={gap}
        data-speed={speed}
        data-colors={colors?.join(",")}
        data-variant={variant}
        {...(noFocus && { "data-no-focus": "" })}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          width: "100%",
          height: "100%",
          ...style,
        }}
        {...props}
      />
    )
  },
)
PixelCanvas.displayName = "PixelCanvas"

export { PixelCanvas }
