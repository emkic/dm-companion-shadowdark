import type { UsePlayerFontScaleReturn } from '../../hooks/usePlayerFontScale'
import './PlayerFontControl.css'

interface Props {
  fontScaleHook: UsePlayerFontScaleReturn
}

export function PlayerFontControl({ fontScaleHook }: Props) {
  const { scale, increase, decrease, canIncrease, canDecrease } = fontScaleHook
  const percent = Math.round(scale * 100)

  return (
    <div className="player-font-control">
      <span className="player-font-label">Player Text</span>
      <button
        className="btn btn-ghost btn-small player-font-button"
        onClick={decrease}
        disabled={!canDecrease}
        title="Decrease player text size"
      >
        <span className="player-font-icon player-font-icon-small">A</span>
        <span className="player-font-sign">−</span>
      </button>
      <span className="player-font-value">{percent}%</span>
      <button
        className="btn btn-ghost btn-small player-font-button"
        onClick={increase}
        disabled={!canIncrease}
        title="Increase player text size"
      >
        <span className="player-font-icon player-font-icon-large">A</span>
        <span className="player-font-sign">+</span>
      </button>
    </div>
  )
}
