"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/presentation/components/ui/popover"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Check, Pipette, Sparkles } from "lucide-react"
import { cn } from "@/core/utils"

export const PRESET_ACCENTS = [
  { id: "orange", label: "Orange", hex: "#f97316" },
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "violet", label: "Violet", hex: "#8b5cf6" },
  { id: "emerald", label: "Emerald", hex: "#10b981" },
  { id: "rose", label: "Rose", hex: "#f43f5e" },
  { id: "cyan", label: "Cyan", hex: "#06b6d4" },
  { id: "amber", label: "Amber", hex: "#f59e0b" },
  { id: "indigo", label: "Indigo", hex: "#6366f1" },
  { id: "teal", label: "Teal", hex: "#14b8a6" },
  { id: "pink", label: "Pink", hex: "#ec4899" },
]

type ColorPickerProps = {
  value: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hexInput, setHexInput] = React.useState(value || "#f97316")

  React.useEffect(() => {
    setHexInput(value)
  }, [value])

  const activePreset = PRESET_ACCENTS.find((p) => p.id === value || p.hex.toLowerCase() === value.toLowerCase())

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      onChange(val)
    }
  }

  const handleNativePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexInput(val)
    onChange(val)
  }

  const currentColorDisplay = activePreset ? activePreset.hex : value.startsWith("#") ? value : "#f97316"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("h-10 px-3 flex items-center justify-between gap-3 bg-card hover:bg-accent/50 border-border", className)}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-5 w-5 rounded-full border border-black/10 shadow-sm shrink-0 transition-transform group-hover:scale-110"
              style={{ backgroundColor: currentColorDisplay }}
            />
            <span className="text-xs font-semibold capitalize">
              {activePreset ? activePreset.label : value.startsWith("#") ? value.toUpperCase() : value}
            </span>
          </div>
          <Pipette className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-4 bg-popover border-border space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Accent Color</span>
          </div>
          <span className="text-[10px] font-mono uppercase text-muted-foreground">
            {currentColorDisplay}
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Presets
          </span>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_ACCENTS.map((preset) => {
              const isSelected = value === preset.id || value.toLowerCase() === preset.hex.toLowerCase()
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onChange(preset.id)
                    setOpen(false)
                  }}
                  className="group relative flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-accent/40 transition-colors"
                  title={preset.label}
                >
                  <span
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center transition-all ring-offset-2 ring-offset-popover shadow-sm",
                      isSelected ? "ring-2 ring-foreground scale-105" : "group-hover:scale-105"
                    )}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Custom Hex Color
          </span>
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-border shrink-0 shadow-sm cursor-pointer group">
              <input
                type="color"
                value={currentColorDisplay}
                onChange={handleNativePicker}
                className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer opacity-0"
              />
              <span
                className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: currentColorDisplay }}
              >
                <Pipette className="h-3.5 w-3.5 text-white drop-shadow opacity-80" />
              </span>
            </div>
            <Input
              value={hexInput}
              onChange={handleHexChange}
              placeholder="#F97316"
              className="h-9 font-mono text-xs uppercase tracking-wider bg-muted/40 border-border"
              maxLength={7}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
