// Hand-drawn style SVGs, kept as strings so they inline with no extra requests.

export const conductor = `
<svg viewBox="0 0 100 132" aria-hidden="true" class="cond">
  <ellipse cx="50" cy="128" rx="26" ry="4" fill="rgba(58,23,48,.25)"/>
  <rect x="38" y="110" width="9" height="16" rx="3" fill="#2A1023"/>
  <rect x="53" y="110" width="9" height="16" rx="3" fill="#2A1023"/>
  <path d="M28 82c0-10 10-16 22-16s22 6 22 16l4 30c0 4-3 6-7 6H31c-4 0-7-2-7-6z" fill="#3A1730"/>
  <path d="M50 68v48" stroke="#5A2A48" stroke-width="1.5"/>
  <circle cx="44" cy="84" r="2.6" fill="#F4CF5D"/><circle cx="44" cy="96" r="2.6" fill="#F4CF5D"/>
  <path d="M38 68l12 8 12-8" fill="#E7A3B6"/>
  <g class="cond-arm"><path d="M70 80c6-6 10-14 12-22" stroke="#3A1730" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="83" cy="55" r="6" fill="#E9B492"/></g>
  <path d="M30 80c-4 8-5 16-4 24" stroke="#3A1730" stroke-width="9" stroke-linecap="round" fill="none"/>
  <circle cx="26" cy="106" r="5.5" fill="#E9B492"/>
  <path d="M27 40c-4 12-2 26 6 30h34c8-4 10-18 6-30z" fill="#2A1420"/>
  <circle cx="50" cy="46" r="21" fill="#EFBE9C"/>
  <path d="M30 40c4-8 12-11 20-11s16 3 20 11c-8-3-14-2-20 2-6-4-12-5-20-2z" fill="#2A1420"/>
  <g class="cond-eyes"><circle cx="42" cy="47" r="2.6" fill="#3A1730"/><circle cx="58" cy="47" r="2.6" fill="#3A1730"/></g>
  <circle cx="37" cy="54" r="4" fill="#E7A3B6" opacity=".7"/><circle cx="63" cy="54" r="4" fill="#E7A3B6" opacity=".7"/>
  <path d="M45 56c3 3 7 3 10 0" stroke="#3A1730" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M27 30c0-9 10-15 23-15s23 6 23 15v4H27z" fill="#3A1730"/>
  <path d="M24 33h52c2 0 3 2 1 3-8 3-46 3-54 0-2-1-1-3 1-3z" fill="#2A1023"/>
  <rect x="44" y="20" width="12" height="8" rx="2" fill="#F4CF5D"/>
  <path d="M47 24h6" stroke="#3A1730" stroke-width="1.2"/>
</svg>`

export const trainIcon = `
<svg viewBox="0 0 44 26" aria-hidden="true">
  <rect x="3" y="7" width="26" height="12" rx="3" fill="#3A1730"/>
  <rect x="25" y="2" width="14" height="17" rx="3" fill="#3A1730"/>
  <rect x="28" y="5" width="8" height="6" rx="1.5" fill="#F4CF5D"/>
  <rect x="7" y="2" width="5" height="6" rx="1" fill="#3A1730"/>
  <path d="M3 13h-3" stroke="#3A1730" stroke-width="2"/>
  <circle cx="11" cy="21" r="4" fill="#E7A3B6" stroke="#3A1730" stroke-width="1.5"/>
  <circle cx="22" cy="21" r="4" fill="#E7A3B6" stroke="#3A1730" stroke-width="1.5"/>
  <circle cx="33" cy="21" r="4" fill="#E7A3B6" stroke="#3A1730" stroke-width="1.5"/>
</svg>`

export const desk = `
<svg viewBox="0 0 240 160" aria-hidden="true">
  <rect x="62" y="12" width="96" height="56" rx="5" fill="#4A2140"/>
  <rect x="67" y="17" width="86" height="44" rx="2" fill="#F6D3DC"/>
  <rect x="73" y="23" width="40" height="5" rx="2" fill="#E7A3B6"/><rect x="73" y="32" width="70" height="3" rx="1.5" fill="#fff"/>
  <rect x="73" y="39" width="60" height="3" rx="1.5" fill="#fff"/><rect x="73" y="46" width="66" height="3" rx="1.5" fill="#fff"/>
  <path d="M52 68h116l8 6H44z" fill="#6B3A57"/>
  <g class="steam" stroke="#E7A3B6" stroke-width="2.5" fill="none" stroke-linecap="round">
    <path d="M184 36c-4-6 4-10 0-16"/><path d="M193 36c-4-6 4-10 0-16"/>
  </g>
  <path d="M176 42h24v24c0 3-2 5-5 5h-14c-3 0-5-2-5-5z" fill="#F4CF5D"/>
  <path d="M200 48c8 0 8 12 0 12" stroke="#F4CF5D" stroke-width="4" fill="none"/>
  <rect x="8" y="73" width="224" height="13" rx="4" fill="#7A4363"/>
  <rect x="18" y="86" width="11" height="68" rx="3" fill="#6B3A57"/>
  <rect x="146" y="86" width="74" height="46" rx="4" fill="#8C5274"/>
  <rect x="172" y="104" width="22" height="5" rx="2.5" fill="#F4CF5D"/>
  <rect x="208" y="132" width="11" height="22" rx="3" fill="#6B3A57"/>
</svg>`

export const shelf = `
<svg viewBox="0 0 180 120" aria-hidden="true">
  <rect x="14" y="40" width="14" height="46" rx="2" fill="#E7A3B6"/>
  <rect x="30" y="34" width="12" height="52" rx="2" fill="#3A1730"/>
  <rect x="44" y="44" width="16" height="42" rx="2" fill="#F4CF5D"/>
  <rect x="62" y="38" width="10" height="48" rx="2" fill="#C27795"/>
  <rect x="80" y="46" width="12" height="42" rx="2" fill="#F6D3DC" transform="rotate(14 86 86)"/>
  <path d="M128 66h28l-4 20h-20z" fill="#E7A3B6"/>
  <path d="M142 66c-10-6-14-20-8-28 6 6 8 18 8 28zm0 0c8-8 18-12 24-8-4 8-14 10-24 8zm0 0c-2-12 2-24 8-28 2 10-2 22-8 28z" fill="#8DB596"/>
  <rect x="6" y="86" width="168" height="10" rx="3" fill="#7A4363"/>
  <path d="M22 96l12 16V96zM158 96l-12 16V96z" fill="#6B3A57"/>
</svg>`

export const chair = `
<svg viewBox="0 0 130 180" aria-hidden="true">
  <rect x="28" y="8" width="74" height="74" rx="20" fill="#E7A3B6"/>
  <rect x="38" y="18" width="54" height="54" rx="14" fill="none" stroke="#D88AA2" stroke-width="3"/>
  <rect x="60" y="80" width="10" height="10" fill="#4A2140"/>
  <rect x="16" y="88" width="98" height="22" rx="11" fill="#D88AA2"/>
  <rect x="60" y="110" width="10" height="34" fill="#4A2140"/>
  <path d="M65 144L22 160M65 144l43 16M65 144v20" stroke="#4A2140" stroke-width="7" stroke-linecap="round"/>
  <circle cx="20" cy="164" r="7" fill="#3A1730"/><circle cx="110" cy="164" r="7" fill="#3A1730"/><circle cx="65" cy="170" r="7" fill="#3A1730"/>
</svg>`

export const bag = `
<svg viewBox="0 0 140 130" aria-hidden="true">
  <path d="M42 42c0-30 56-30 56 0" stroke="#3A1730" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path class="lace" d="M64 44c-6-12-20-14-26-6-4 6 2 12 8 8" stroke="#F09AB4" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <rect x="40" y="38" width="6" height="9" rx="2" fill="#FFFBF7" transform="rotate(-30 43 42)" class="lace"/>
  <path d="M20 42h100l10 80H10z" fill="#F4CF5D"/>
  <path d="M15 70h110l2 14H13z" fill="#E7A3B6"/>
  <circle cx="70" cy="100" r="8" fill="#FFFBF7" opacity=".8"/>
  <path d="M66 100l3 3 6-6" stroke="#E7A3B6" stroke-width="2.4" fill="none"/>
</svg>`

export const shoes = `
<svg viewBox="0 0 150 70" aria-hidden="true">
  <g>
    <path d="M6 50c0-12 8-24 18-26l14-2c6 8 16 10 28 12 6 2 8 8 8 14v6H8c-2 0-2-2-2-4z" fill="#F09AB4"/>
    <path d="M6 54h68v6c0 3-2 5-5 5H11c-3 0-5-2-5-5z" fill="#FFFBF7"/>
    <path d="M30 30l6 6M36 27l6 6M42 26l6 6" stroke="#FFFBF7" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M56 38c8 0 16 4 18 12H54z" fill="#E7A3B6"/>
  </g>
  <g transform="translate(70 -4)">
    <path d="M6 50c0-12 8-24 18-26l14-2c6 8 16 10 28 12 6 2 8 8 8 14v6H8c-2 0-2-2-2-4z" fill="#F09AB4"/>
    <path d="M6 54h68v6c0 3-2 5-5 5H11c-3 0-5-2-5-5z" fill="#FFFBF7"/>
    <path d="M30 30l6 6M36 27l6 6M42 26l6 6" stroke="#FFFBF7" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M56 38c8 0 16 4 18 12H54z" fill="#E7A3B6"/>
  </g>
</svg>`

export const brain = `
<svg viewBox="0 0 72 66" aria-hidden="true">
  <path d="M10 34C4 24 10 12 20 12c2-8 14-10 18-4 6-6 20-2 20 8 10 2 10 16 4 22 4 10-6 18-14 14-6 6-18 6-22 0-10 4-20-4-16-18z" fill="#F4A9C0" stroke="#C25A82" stroke-width="2.5"/>
  <path d="M20 12c4 8-2 14 2 20M38 8c-2 8 4 12 0 20M58 16c-6 4-4 12-8 16M26 52c2-6 8-6 8-12M48 52c-2-6 4-10 8-8" stroke="#C25A82" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="27" cy="32" r="7" fill="#fff"/><circle cx="46" cy="32" r="7" fill="#fff"/>
  <circle cx="28" cy="33" r="3.4" fill="#3A1730"/><circle cx="45" cy="33" r="3.4" fill="#3A1730"/>
  <ellipse cx="36.5" cy="45" rx="4" ry="5" fill="#3A1730"/>
  <path d="M64 10c3 4 4 7 1 9-3 1-5-2-3-5z" fill="#FFFBF7" stroke="#C25A82" stroke-width="1.5"/>
</svg>`

export const pillow = `
<svg viewBox="0 0 300 110" aria-hidden="true" preserveAspectRatio="none">
  <path d="M22 30C12 10 40 12 46 14c70-12 140-12 208 0 6-2 34-4 24 16 14 24 14 26 0 50 10 20-18 18-24 16-68 12-138 12-208 0-6 2-34 4-24-16-14-24-14-26 0-50z" fill="#FFFBF7" stroke="#E7A3B6" stroke-width="4"/>
  <path d="M40 30c70-10 150-10 220 0M40 80c70 10 150 10 220 0" stroke="#F6D3DC" stroke-width="3" stroke-dasharray="7 7" fill="none"/>
</svg>`

export const blanket = `
<svg viewBox="0 0 320 170" aria-hidden="true" preserveAspectRatio="none">
  <path d="M0 34c40-22 80 0 120-10s80-16 120-6 60 4 80-4v156H0z" fill="#E7A3B6"/>
  <path d="M0 34c40-22 80 0 120-10s80-16 120-6 60 4 80-4v22c-20 8-40 10-80 4s-80 0-120 8-80-10-120 10z" fill="#FFFBF7"/>
  <g fill="#F4CF5D">
    <path d="M40 90l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1zM130 120l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1zM220 84l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1zM280 132l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1zM84 146l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1zM180 70l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z"/>
  </g>
</svg>`

// Flames are separate small elements so their flicker never repaints the cake.
export const flame = `
<svg viewBox="-20 -28 40 44" aria-hidden="true" class="flame-svg">
  <circle r="19" cy="-5" fill="url(#fglow)"/>
  <defs><radialGradient id="fglow"><stop offset="0" stop-color="#FFE6A3" stop-opacity=".85"/><stop offset="1" stop-color="#FFE6A3" stop-opacity="0"/></radialGradient></defs>
  <g class="flame-body">
    <path d="M0-20C6-11 9-4 9 2c0 6-4 9-9 9s-9-3-9-9c0-6 3-13 9-22z" fill="#F4CF5D"/>
    <path d="M0-9c3 5 4 8 4 11 0 3-2 5-4 5s-4-2-4-5c0-3 1-6 4-11z" fill="#FFF6D8"/>
  </g>
</svg>`

const candle = (x) => `
  <rect x="${x - 6}" y="58" width="12" height="44" rx="3" fill="#FFFBF7"/>
  <path d="M${x - 6} 66l12-6M${x - 6} 78l12-6M${x - 6} 90l12-6M${x - 6} 102l12-6" stroke="#E7A3B6" stroke-width="4"/>
  <path d="M${x} 58v-6" stroke="#3A1730" stroke-width="2"/>`

export const cake = `
<svg viewBox="0 0 260 260" aria-hidden="true">
  <ellipse cx="130" cy="238" rx="118" ry="16" fill="#FFFBF7" stroke="#E7A3B6" stroke-width="4"/>
  <rect x="34" y="150" width="192" height="86" rx="16" fill="#E7A3B6"/>
  <path d="M34 166c0-10 6-16 16-16h160c10 0 16 6 16 16v6c-8 0-8 14-16 14s-8-12-16-12-8 18-16 18-8-16-16-16-8 10-16 10-8-14-16-14-8 18-16 18-8-12-16-12-8 14-16 14-8-16-16-16-8 10-16 10-8-14-16-14z" fill="#FFFBF7"/>
  <g fill="#F4CF5D"><rect x="60" y="200" width="10" height="4" rx="2" transform="rotate(30 65 202)"/><rect x="104" y="214" width="10" height="4" rx="2" transform="rotate(-20 109 216)"/><rect x="150" y="204" width="10" height="4" rx="2" transform="rotate(50 155 206)"/><rect x="190" y="216" width="10" height="4" rx="2" transform="rotate(-40 195 218)"/><rect x="82" y="224" width="8" height="4" rx="2"/><rect x="172" y="226" width="8" height="4" rx="2" transform="rotate(20 176 228)"/></g>
  <rect x="64" y="100" width="132" height="58" rx="14" fill="#F6D3DC"/>
  <path d="M64 114c0-8 6-14 14-14h104c8 0 14 6 14 14v4c-6 0-6 12-14 12s-6-10-14-10-6 14-14 14-6-12-14-12-6 8-14 8-6-12-14-12-6 14-14 14-6-10-14-10-6 10-12 10-6-12-14-12z" fill="#F09AB4"/>
  <circle cx="130" cy="140" r="7" fill="#F4CF5D"/><circle cx="94" cy="144" r="4" fill="#FFFBF7"/><circle cx="166" cy="144" r="4" fill="#FFFBF7"/>
  ${candle(98)}${candle(130)}${candle(162)}
</svg>`

export const lamp = `
<svg viewBox="0 0 40 140" aria-hidden="true">
  <rect x="18" y="30" width="4" height="110" fill="#2A1023"/>
  <path d="M8 22h24l-4 12H12z" fill="#3A1730"/>
  <circle class="bulb" cx="20" cy="38" r="6" fill="#6B3A57"/>
  <rect x="14" y="16" width="12" height="6" rx="2" fill="#3A1730"/>
</svg>`

export const heartDoodle = `<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20S2 13 2 7c0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 6-10 13-10 13z" fill="currentColor"/></svg>`
