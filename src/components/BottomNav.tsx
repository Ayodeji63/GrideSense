import { BiHomeAlt, BiMapAlt, BiQrScan, BiUser } from 'react-icons/bi'

export type Screen = 'home' | 'map' | 'activities' | 'profile'

type BottomNavProps = {
  screen: Screen
  onChange: (screen: Screen) => void
}

const navItems = [
  { id: 'home', label: 'Home', Icon: BiHomeAlt },
  { id: 'map', label: 'Map', Icon: BiMapAlt },
  { id: 'activities', label: 'Activities', Icon: BiQrScan },
  { id: 'profile', label: 'Profile', Icon: BiUser },
] as const

export function BottomNav({ screen, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {navItems.map(({ id, label, Icon }) => (
        <button
          aria-current={screen === id ? 'page' : undefined}
          className={screen === id ? 'active' : ''}
          key={id}
          onClick={() => onChange(id)}
          type="button"
        >
          <Icon aria-hidden="true" />
          {label}
        </button>
      ))}
    </nav>
  )
}
