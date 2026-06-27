interface Props {
  x: number
  y: number
}

export function DmZone({ x, y }: Props) {
  return (
    <div
      className="dm-zone"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="dm-zone__label">DM</div>
    </div>
  )
}
