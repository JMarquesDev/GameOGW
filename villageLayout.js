// Coordinates, footprints and patrol routes are data, independent of React/UI.
export const FARM_BUILDINGS = [
  { id: 'barn', kind: 'barn', x: 1920, y: 1580, w: 220, h: 150 },
  { id: 'coop', kind: 'coop', x: 2060, y: 1840, w: 110, h: 90 },
]
export const ANIMAL_PENS = [
  { id: 'pasture', x: 1905, y: 1860, w: 140, h: 165 },
  { id: 'hens', x: 2060, y: 1950, w: 115, h: 90 },
]
export const FARM_OBSTACLES = [[1895,1525,2200,1550], ...[...FARM_BUILDINGS, ...ANIMAL_PENS].map(p => [p.x, p.y, p.x + p.w, p.y + p.h])]
export const onFarmBridge = p => p.x >= 1730 && p.x <= 1910 && p.y >= 1750 && p.y <= 1810
export function eastRiverWalkable(p, sealBridgeOpen = false) {
  return !(p.x > 1745 && p.x < 1895) || onFarmBridge(p) || (sealBridgeOpen && p.y > 658 && p.y < 802)
}
export const TORO_LIGHTS = [[900, 1690], [1165, 1800], [1540, 1780], [1730, 1790], [2050, 1740]]
export const GARDEN = { x: 930, y: 1950 }
export const VILLAGER_ROUTES = [
  { id: 'lia', name: 'Lia, guardiã do poço', role: 'citizen', color: '#719889', route: [[910,1790],[910,1850],[1060,1850],[1095,1835],[1095,1830],[910,1830]], text: 'O poço pertence a todos. Ao entardecer acendemos cada lanterna para guiar quem volta do bosque.' },
  { id: 'teo', name: 'Téo, carpinteiro', role: 'citizen', color: '#b6794b', route: [[1355,1760],[1470,1770],[1530,1820],[1350,1820],[1355,1760]], text: 'Madeira seca no celeiro, cercas firmes e lanternas acesas. É assim que uma vila resiste a uma noite longa.' },
  { id: 'nina', name: 'Nina, horticultora', role: 'farmer', color: '#bd894c', route: [[820,1950],[900,1950],[1000,1950],[1060,1950]], text: 'Experimente o canteiro no centro da horta: plante, espere as folhas crescerem e volte para colher. As ervas do Curandeiro continuam no bosque.' },
  { id: 'bento', name: 'Bento, fazendeiro', role: 'farmer', color: '#8c6645', route: [[790,1935],[870,1935],[970,1935],[1050,1935]], text: 'A terra precisa de tempo e água. Eu preparo as fileiras; Nina cuida das mudas. Os animais ficam seguros no cercado a leste.' },
  { id: 'clara', name: 'Clara, tecelã', role: 'citizen', color: '#a87588', route: [[780,1740],[900,1740],[900,1860],[780,1860]], text: 'As mantas nas janelas são nossas. Cada casa tem uma cor para os viajantes encontrarem seus anfitriões.' },
  { id: 'rui', name: 'Rui, tratador', role: 'citizen', color: '#628097', route: [[1580,1790],[1720,1790],[1900,1770],[2040,1770],[1720,1790]], text: 'Cavalos, vacas, porcos e galinhas: ninguém passa fome por aqui. Por favor, não assuste os pequenos perto do galinheiro.' },
]
