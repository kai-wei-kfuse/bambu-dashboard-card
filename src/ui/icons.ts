import { svg } from 'lit';

const paths: Record<string, string> = {
  printer: 'M5 20V4h14v16M3 20h18M7 7h10M12 7v5m-2 0h4m-6 5h8M6 4V2h12v2',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  arrow: 'm9 5 7 7-7 7',
  back: 'm14 5-7 7 7 7',
  play: 'm8 4 12 8-12 8z',
  pause: 'M7 4h3v16H7zM14 4h3v16h-3z',
  stop: 'M5 5h14v14H5z',
  camera: 'M3 7h12v12H3zM15 11l6-3v10l-6-3M6 7l2-3h4l2 3',
  spool: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M12 3v6m0 6v6M3 12h6m6 0h6',
  folder: 'M3 6h7l2 3h9v11H3zM3 6V4h7l2 2',
  tune: 'M3 6h18M3 12h18M3 18h18M8 3v6m8 0v6m-9 0v6',
  refresh: 'M20 8a9 9 0 1 0 1 7M20 3v6h-6',
  light: 'M8 14a6 6 0 1 1 8 0l-1 3H9zM9 20h6M10 23h4',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v6l4 2',
  heat: 'M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0M12 8v9',
  check: 'm4 12 5 5L20 6',
  alert: 'M12 3 2 21h20zM12 9v5m0 3v1',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  close: 'm5 5 14 14M5 19 19 5',
  search: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6',
};

export function icon(name: string) {
  return svg`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${paths[name] || paths.printer}></path></svg>`;
}

export function printerIllustration() {
  return svg`<svg viewBox="0 0 320 220" class="printer-art" fill="none" aria-hidden="true">
    <ellipse cx="160" cy="193" rx="105" ry="13" fill="currentColor" opacity=".04"/>
    <path d="M88 180V43h144v137M99 180V54h122v126" stroke="currentColor" stroke-width="5" opacity=".7"/>
    <path d="M94 94h132M94 103h132" stroke="currentColor" stroke-width="4" opacity=".45"/>
    <path d="M151 88h31v29h-31zM160 117h14l-7 11z" fill="var(--bd-accent)" fill-opacity=".8"/>
    <path d="m101 155 79-7 42 17-80 8z" stroke="currentColor" stroke-width="3" fill="currentColor" fill-opacity=".08"/>
    <path d="M142 173v9m80-17v9M101 155v10l41 17 80-8M72 184h175v10H72z" stroke="currentColor" stroke-width="3"/>
    <path d="m151 151 0-22 19-6 14 8v19l-18 7z" fill="var(--bd-accent)" fill-opacity=".14" stroke="var(--bd-accent)" stroke-width="2"/>
    <path d="m151 129 15 9 18-7m-18 7v19" stroke="var(--bd-accent)" stroke-width="2"/>
    <path d="M199 43V21m-16 0h32M200 23c-23 0-40 15-33 65" stroke="currentColor" stroke-width="2" opacity=".35"/>
  </svg>`;
}
