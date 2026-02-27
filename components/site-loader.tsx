"use client"

import { useEffect, useState } from "react"

const MIN_VISIBLE_MS = 700
const FADE_OUT_MS = 420
const MAX_WAIT_MS = 2500
const SESSION_KEY = "g3-loader-shown"

export function SiteLoader() {
  const [exiting, setExiting] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return
    sessionStorage.setItem(SESSION_KEY, "1")
    setVisible(true)

    const startTime = Date.now()
    let completed = false
    let minimumTimer: number | null = null
    let fadeTimer: number | null = null
    let safetyTimer: number | null = null

    const finish = () => {
      if (completed) return
      completed = true
      setExiting(true)
      fadeTimer = window.setTimeout(() => {
        setVisible(false)
      }, FADE_OUT_MS)
    }

    const resolveWithMinimumDelay = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)
      minimumTimer = window.setTimeout(finish, remaining)
    }

    if (document.readyState === "complete") {
      resolveWithMinimumDelay()
    } else {
      window.addEventListener("load", resolveWithMinimumDelay, { once: true })
      safetyTimer = window.setTimeout(resolveWithMinimumDelay, MAX_WAIT_MS)
    }

    return () => {
      window.removeEventListener("load", resolveWithMinimumDelay)
      if (minimumTimer) window.clearTimeout(minimumTimer)
      if (fadeTimer) window.clearTimeout(fadeTimer)
      if (safetyTimer) window.clearTimeout(safetyTimer)
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    document.body.classList.add("site-loading")
    return () => {
      document.body.classList.remove("site-loading")
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className={`site-loader ${exiting ? "is-exiting" : ""}`} aria-hidden="true">
      <div className="site-loader-inner">
        <p className="site-loader-brand">G3</p>
        <p className="site-loader-subtitle">Servizio & Esperienza</p>
        <span className="site-loader-line" />
      </div>
    </div>
  )
}
