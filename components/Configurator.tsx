"use client"

import { useState } from "react"
import { KeycapControls } from "@/components/KeycapControls"
import { KeycapPreview } from "@/components/KeycapPreview"
import {
  addKeycap,
  createInitialSetState,
  removeSelectedKeycap,
} from "@/lib/keycap-set"

export function Configurator() {
  const [state, setState] = useState(createInitialSetState)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:flex-row">
      <div className="md:w-80 md:shrink-0">
        <KeycapControls
          state={state}
          setState={setState}
          onAdd={() => setState((s) => addKeycap(s))}
          onRemove={() => setState((s) => removeSelectedKeycap(s))}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900">
          Keycap configurator
        </h1>
        <p className="mb-4 text-sm text-neutral-600">
          Add keys, pick filament colors, set icons or characters, then download.
        </p>
        <KeycapPreview
          keycaps={state.keycaps}
          selectedKeycapId={state.selectedKeycapId}
          onSelect={(id) => setState((s) => ({ ...s, selectedKeycapId: id }))}
        />
      </div>
    </div>
  )
}
