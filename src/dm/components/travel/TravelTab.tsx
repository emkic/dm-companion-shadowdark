import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HEXES_PER_DAY, ACTIVITY_LABELS } from '@shared/types'
import type { LocationState, ActivityState, TravelMethod, WatchSlot } from '@shared/types'
import './TravelTab.css'

const ACTIVITIES: ActivityState[] = ['traveling', 'city']
const TRAVEL_METHODS: { value: TravelMethod; label: string }[] = [
  { value: 'walking', label: `Walking (${HEXES_PER_DAY.walking}/day)` },
  { value: 'mounted', label: `Mounted (${HEXES_PER_DAY.mounted}/day)` },
  { value: 'sailing', label: `Sailing (${HEXES_PER_DAY.sailing}/day)` }
]

const WATCH_IDS = ['watch-0', 'watch-1', 'watch-2', 'watch-3'] as const
const WATCH_LABELS = ['Watch 1', 'Watch 2', 'Watch 3', 'Watch 4']

interface Props {
  location: LocationState
  setActivity: (activity: ActivityState) => void
  newDay: () => void
  setTravelMethod: (method: TravelMethod) => void
  togglePushing: () => void
  spendHexes: (count: number) => void
  toggleChecklist: (key: keyof LocationState['checklist']) => void
  toggleCamping: () => void
  toggleCampfire: () => void
  setWatchName: (index: number, name: string) => void
  toggleWatchEncounter: (index: number) => void
  reorderWatches: (newOrder: [WatchSlot, WatchSlot, WatchSlot, WatchSlot]) => void
}

function SortableWatch({ id, index, watch, label, setWatchName, toggleWatchEncounter }: {
  id: string
  index: number
  watch: WatchSlot
  label: string
  setWatchName: (index: number, name: string) => void
  toggleWatchEncounter: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className="watch-slot">
      <div className="watch-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        &#x2807;
      </div>
      <span className="watch-label">{label}</span>
      <input
        type="text"
        value={watch.name}
        onChange={e => setWatchName(index, e.target.value)}
        placeholder="Player name..."
        className="form-input watch-name-input"
      />
      <label className="watch-check" title="Encounter?">
        <input
          type="checkbox"
          checked={watch.encounter}
          onChange={() => toggleWatchEncounter(index)}
        />
        <span>Enc</span>
      </label>
    </div>
  )
}

export function TravelTab({
  location, setActivity, newDay, setTravelMethod, togglePushing,
  spendHexes, toggleChecklist, toggleCamping, toggleCampfire,
  setWatchName, toggleWatchEncounter, reorderWatches
}: Props) {
  const maxHexes = location.isPushing
    ? Math.floor(HEXES_PER_DAY[location.travelMethod] * 1.5)
    : HEXES_PER_DAY[location.travelMethod]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleWatchDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = WATCH_IDS.indexOf(active.id as typeof WATCH_IDS[number])
    const newIndex = WATCH_IDS.indexOf(over.id as typeof WATCH_IDS[number])
    const reordered = arrayMove([...location.watches], oldIndex, newIndex) as [WatchSlot, WatchSlot, WatchSlot, WatchSlot]
    reorderWatches(reordered)
  }

  return (
    <div className="travel-tab">
      {/* Activity + New Day */}
      <div className="travel-tab-header">
        <div className="activity-toggle">
          {ACTIVITIES.map(a => (
            <button
              key={a}
              className={`btn btn-small ${location.activity === a ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActivity(a)}
            >
              {ACTIVITY_LABELS[a]}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={newDay}>
          New Day
        </button>
      </div>

      {/* Traveling-specific */}
      {location.activity === 'traveling' && (
        <>
          <div className="travel-controls">
            <div className="travel-controls-row">
              <div className="field-group">
                <label className="field-label">Travel Method</label>
                <select
                  value={location.travelMethod}
                  onChange={e => setTravelMethod(e.target.value as TravelMethod)}
                  className="form-select"
                >
                  {TRAVEL_METHODS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Pushing</label>
                <button
                  className={`btn btn-small ${location.isPushing ? 'btn-accent' : 'btn-ghost'}`}
                  onClick={togglePushing}
                >
                  {location.isPushing ? 'Pushing (1.5x)' : 'Normal'}
                </button>
              </div>
            </div>

            {location.isPushing && (
              <div className="travel-reminder pushing-reminder">
                Pushing: +1:6 encounter chance, no foraging allowed
              </div>
            )}
          </div>

          {/* Hex tracker */}
          <div className="hex-tracker-wide">
            <label className="field-label">Hexes Remaining</label>
            <div className="hex-display-wide">
              <span className={`hex-count ${location.hexesRemaining === 0 ? 'exhausted' : ''}`}>
                {location.hexesRemaining} / {maxHexes}
              </span>
              <button
                className="btn btn-small btn-ghost"
                onClick={() => spendHexes(1)}
                disabled={location.hexesRemaining === 0}
              >
                -1 Hex
              </button>
              <button
                className="btn btn-small btn-ghost"
                onClick={() => spendHexes(2)}
                disabled={location.hexesRemaining < 2}
                title="Difficult terrain costs 2 hexes"
              >
                -2 Hex (Difficult)
              </button>
            </div>
          </div>

          {/* Checklist */}
          <div className="travel-checklist-wide">
            <label className="field-label">Daily Checklist</label>
            <div className="checklist-grid">
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={location.checklist.weatherRolled}
                  onChange={() => toggleChecklist('weatherRolled')}
                />
                <span className="checklist-text">Pick / roll weather</span>
                <span className="checklist-hint">2d6 on weather hex</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={location.checklist.rationsConsumed}
                  onChange={() => toggleChecklist('rationsConsumed')}
                />
                <span className="checklist-text">Rations consumed?</span>
                <span className="checklist-hint">1d4 CON dmg if not</span>
              </label>
              {!location.isPushing && (
                <label className="checklist-item">
                  <input
                    type="checkbox"
                    checked={location.checklist.foragingAttempt}
                    onChange={() => toggleChecklist('foragingAttempt')}
                  />
                  <span className="checklist-text">Foraging attempt?</span>
                  <span className="checklist-hint">INT check for 1 ration</span>
                </label>
              )}
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={location.checklist.encounterDay1}
                  onChange={() => toggleChecklist('encounterDay1')}
                />
                <span className="checklist-text">Encounter — Day 1</span>
                <span className="checklist-hint">1:6 chance{location.isPushing ? ' (+1:6 pushing)' : ''}</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={location.checklist.encounterDay2}
                  onChange={() => toggleChecklist('encounterDay2')}
                />
                <span className="checklist-text">Encounter — Day 2</span>
                <span className="checklist-hint">1:6 chance{location.isPushing ? ' (+1:6 pushing)' : ''}</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={location.checklist.encounterNight1}
                  onChange={() => toggleChecklist('encounterNight1')}
                />
                <span className="checklist-text">Encounter — Night 1</span>
                <span className="checklist-hint">1:6 chance</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={location.checklist.encounterNight2}
                  onChange={() => toggleChecklist('encounterNight2')}
                />
                <span className="checklist-text">Encounter — Night 2</span>
                <span className="checklist-hint">1:6 chance</span>
              </label>
            </div>
          </div>

          {/* Camping section */}
          <div className="camping-section">
            <div className="camping-header">
              <button
                className={`btn btn-small ${location.isCamping ? 'btn-accent' : 'btn-ghost'}`}
                onClick={toggleCamping}
              >
                {location.isCamping ? '🏕 Camping' : '🏕 Make Camp'}
              </button>
              {location.isCamping && (
                <label className="checklist-item campfire-toggle">
                  <input
                    type="checkbox"
                    checked={location.hasCampfire}
                    onChange={toggleCampfire}
                  />
                  <span>🔥 Campfire / Light</span>
                </label>
              )}
            </div>

            {location.isCamping && (
              <div className="watch-order">
                <label className="field-label">Watch Order (drag to reorder)</label>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleWatchDragEnd}>
                  <SortableContext items={[...WATCH_IDS]} strategy={verticalListSortingStrategy}>
                    {location.watches.map((watch, i) => (
                      <SortableWatch
                        key={WATCH_IDS[i]}
                        id={WATCH_IDS[i]}
                        index={i}
                        watch={watch}
                        label={WATCH_LABELS[i]}
                        setWatchName={setWatchName}
                        toggleWatchEncounter={toggleWatchEncounter}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </>
      )}

      {location.activity === 'city' && (
        <div className="travel-reminder city-reminder">
          Resting in town — no travel, encounters, or foraging checks needed.
        </div>
      )}

    </div>
  )
}
