'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface InstallButtonProps {
  postUrl: string
  title: string
}

export function InstallButton({ postUrl, title }: InstallButtonProps) {
  const [showOptions, setShowOptions] = useState(false)

  const handleInstall = () => {
    // Try deep link first
    window.location.href = `openclaw://install?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(title)}`
    
    // Fallback: show options after a delay
    setTimeout(() => setShowOptions(true), 1000)
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(postUrl)
    alert('URL copied! Paste in OpenClaw to install.')
  }

  const handleDownloadClaw = () => {
    // Create .claw file for manual import
    const clawContent = JSON.stringify({
      version: '1.0',
      title,
      sourceUrl: postUrl,
      installedAt: new Date().toISOString(),
    }, null, 2)

    const blob = new Blob([clawContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.claw`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-200">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h4 className="font-semibold text-gray-900">Install to OpenClaw</h4>
          <p className="text-sm text-gray-600">
            One-click install this script to your OpenClaw
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleInstall}>Install Script</Button>
        </div>
      </div>

      {showOptions && (
        <div className="mt-4 pt-4 border-t border-orange-200">
          <p className="text-sm text-gray-600 mb-3">
            OpenClaw app not detected. Try these options:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyUrl}>
              Copy URL
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadClaw}>
              Download .claw file
            </Button>
            <a
              href="https://github.com/openclaw/openclaw"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm">
                Get OpenClaw
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
