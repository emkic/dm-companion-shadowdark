import type { Season, DangerLevel, TimerState } from './types'

export const DEFAULT_TORCH_SECONDS = 3600   // 60 minutes
export const LOW_TORCH_THRESHOLD = 0.25     // below 25% = low alert

let timerCounter = 0
export function createDefaultTimer(): TimerState {
  return {
    id: `timer-${Date.now()}-${timerCounter++}`,
    label: 'Torch',
    lightMode: 'torch',
    timeLeft: DEFAULT_TORCH_SECONDS,
    isRunning: false,
    isExtinguished: false,
    hideTimerFromPlayer: false
  }
}

export const WEATHER_BY_SEASON: Record<Season, string[]> = {
  spring: [
    'Heavy Rainfall',
    'Short Showers',
    'Warm Drizzle',
    'Snowy Rain',
    'Sleet',
    'Windy & Snowy',
    'Nippy & Humid',
    'Hail',
    'Heavy Snowfall',
    'Warm & Humid',
    'Clear & Nippy',
    'Cold Wafts of Mist',
    'Light Snowfall',
    'Cloudy & Warm',
    'Sunny & Clear',
    'Coldly & Dry',
    'Hot & Dry',
    'Strong Pollen Drift',
    'Pleasantly Warm'
  ],
  summer: [
    'Torrential Rain',
    'Warm Storm',
    'Downpour',
    'Fierce Wind',
    'Warm Rain',
    'Cloudy & Humid',
    'Cloudy & Windy',
    'Partly Cloudy & Nippy',
    'Short Warm Showers',
    'Pleasantly Warm',
    'Warm Breeze',
    'Clear & Nippy',
    'Warm Drizzle',
    'Warm & Cloudy',
    'Hot & Dry',
    'Sunny & Clear',
    'Hot & Muggy',
    'Hot & Windy',
    'Dry Heat Surges'
  ],
  autumn: [
    'Goose Summer',
    'Pleasantly Warm',
    'Sporadic Gusts',
    'Cold Winds',
    'Sunny & Nippy',
    'Sunny & Clear',
    'Cold Wafts of Mist',
    'Frosty & Cloudy',
    'Drizzle',
    'Humid & Cloudy',
    'Thick Fog Soup',
    'Cloudy & Nippy',
    'Rain & Gusts',
    'Rain & Fog',
    'Windy & Clear',
    'Rainy Windstorm',
    'Heavy Downpour',
    'Short Light Showers'
  ],
  winter: [
    'Sunny & Nippy',
    'Light Drizzle',
    'Cloudy & Nippy',
    'Cold Fog Wafts',
    'Heavy Rain',
    'Cold & Clear',
    'Clear & Windy',
    'Cold Rain Showers',
    'Cold Winds',
    'Hail',
    'Cold & Humid',
    'Cold & Cloudy',
    'Snowy Rain',
    'Wet Snowfall',
    'Icy & Cloudy',
    'Blizzard',
    'Windy & Snowy',
    'Sleet',
    'Light Snowfall'
  ]
}

export const DANGER_LEVELS: DangerLevel[] = ['unsafe', 'risky', 'deadly']
export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']
