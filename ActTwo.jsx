import { createPlayerAnimation, updatePlayerAnimation, preloadPlayerRunSprites, drawAnimatedPlayer } from './playerAnimation'
import { startBoost, updateBoost } from './playerBoost'
import { useCallback, useEffect, useRef, useState } from 'react'
import { GameHud } from './ui/GameHud'
import { useGameClock, useGamePause } from './ui/gamePause'
import { ACT_WORLD, CORE, MEMORIES, inStation, validActPosition, drawActMap } from './beyondWorld'
import { createCombat, updateCombat, castStaff, MAX_HEALTH } from './mutantCombat'
import { createCivilians, updateCivilians, drawCivilian } from './cityLife'
import { beginBoarding, advanceHunterDialogue, collectTicket, boardReturnTrain, huntLocked, validCombatPosition, huntObjective, ticketsAvailable } from './metroHunt'
import { TRAIN_ENTRY, RETURN_ENTRY, TICKETS, HUNTER_LINES, BOSS_BAR_HP } from './metroRoute'
import { drawMetroMarkers, drawPredatorTelegraph, drawPredator, drawSuspense, metroHud } from './metroVisuals'
import './metroHunt.css'

const SPRITES = { down: '/assets/ratoFrente.png', up: '/assets/ratoCostas.png', left: '/assets/ratoEsquerda.png', right: '/assets/ratoDireita.png', mutant: '/assets/mutante-07b.png', predator: '/assets/predador-sprites.png' }
const STORIES = {
  entry: { speaker: 'Os esquecidos da 07-B', text: 'Sob a plataforma, olhos amarelos se abrem. As criaturas têm as mesmas marcas de injeção que você. São outros animais alterados pelo laboratório, perdidos num medo que não termina. O cajado responde ao sinal da estação. Use F ou Espaço para disparar; afaste-se quando erguerem as garras. A luz pode interromper a mutação descontrolada.' },
  wave: { speaker: 'Mais passos no túnel', text: 'Três criaturas caem exaustas e o sinal enfraquece. Outras duas saem do túnel de serviço. O cajado recupera parte da sua força. Continue: o painel de contenção está quase sem energia.' },
  clear: { speaker: 'O silêncio da plataforma', text: 'A última criatura se aquieta. Por um instante, ninguém o persegue. A primeira porta do vagão se abre ao norte. Talvez ele leve a algum lugar longe daqui. Entre: você precisa tentar.' },
  hunterRetry: { speaker: 'Mais uma chance', text: 'O cajado o protege do golpe final. O Predador ainda bloqueia o vagão. Espere a marca vermelha no chão, use Q para sair da trajetória e dispare durante a recuperação das garras.' },
  hunterDefeated: { speaker: 'O contrato encerrado', text: 'As garras riscam o chão uma última vez. O Predador cai. O vagão ao norte está travado, mas há outra linha na plataforma inferior, no sentido oposto. Recolha os três tickets de acesso espalhados pela plataforma para abrir a passagem ao sul.' },
  ticketsReady: { speaker: 'Outra direção', text: 'Os três tickets validam a rota, a baldeação e a saída. A grade ao sul se abre. Siga para baixo e entre no outro vagão. Desta vez, ninguém está esperando na porta.' },
  arrival: { speaker: 'Próxima parada · Anexo 07-B', text: 'O vagão segue na direção contrária e chega ao anexo. O terminal está aqui. Recupere os registros que faltam para descobrir o que ainda prende os outros sujeitos.' },
  retry: { speaker: 'A luz ainda resiste', text: 'O cajado protege sua consciência e o traz de volta à rua. As memórias foram preservadas. Respire, mantenha distância e dispare com F ou Espaço. Ao voltar à estação, o encontro recomeçará.' },
}
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
function drawMutant(c, e, image, time) {
  if (!image || e.hp <= 0) return
  c.save(); c.translate(e.x, e.y)
  c.fillStyle = '#06101d99'; c.beginPath(); c.ellipse(0, 1, 26, 8, 0, 0, Math.PI * 2); c.fill()
  c.save(); c.scale(e.facing, 1); c.imageSmoothingEnabled = false
  if (e.hitFlash) { c.shadowColor = '#d3ffff'; c.shadowBlur = 18 }
  c.drawImage(image, -48, -91 + Math.sin(time / 180 + e.homeX) * 2, 98, 104); c.restore()
  c.fillStyle = '#07121c'; c.fillRect(-23, -100, 46, 5); c.fillStyle = '#b6a264'; c.fillRect(-23, -100, 46 * e.hp / 3, 5)
  if (e.windup) {
    c.strokeStyle = '#ffcb78'; c.lineWidth = 3
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 10 - 7, -45); c.lineTo(i * 10 + 7, -23); c.stroke() }
    c.fillStyle = '#ffdd9c'; c.font = 'bold 17px monospace'; c.textAlign = 'center'; c.fillText('!', 0, -109)
  }
  c.restore()
}
function drawGuide(c, s) {
  if (huntLocked(s) || s.hunt.phase === 'fight') return
  const target = s.hunt.phase === 'boarding' ? TRAIN_ENTRY : s.hunt.phase === 'tickets' ? TICKETS.find(t => !s.hunt.tickets.includes(t.id)) : s.hunt.phase === 'ready' ? RETURN_ENTRY : !s.fragments.includes('street') ? MEMORIES[0] : !s.cleared ? { x: 1060, y: 790 } : MEMORIES.find(m => !s.fragments.includes(m.id)) || CORE
  const dx = target.x - s.player.x; const dy = target.y - s.player.y
  if (Math.hypot(dx, dy) < 95) return
  c.save(); c.translate(s.player.x, s.player.y + 5); c.rotate(Math.atan2(dy, dx))
  c.fillStyle = '#c4dfc3bb'; c.beginPath(); c.moveTo(42, 0); c.lineTo(32, -5); c.lineTo(32, 5); c.fill(); c.restore()
}
export default function ActTwo({ Brand, Dialogue, TouchControls, MissionPanel, onFinish, checkpoint = 'street' }) {
  const pause = useGamePause()
  const clock = useGameClock()
  const [playerAnimation] = useState(createPlayerAnimation)
  const canvasRef = useRef(null)
  const [initialGame] = useState(() => {
    const s = createCombat()
    if (checkpoint === 'metro') { s.player = { x: 635, y: 610, direction: 'right' }; s.fragments = ['street'] }
    if (checkpoint === 'predator') { s.player = { x: 748, y: 590, direction: 'up' }; s.started = true; s.cleared = true; s.kills = 5; s.wave = 2; s.hunt.phase = 'boarding'; s.fragments = ['street'] }
    if (checkpoint === 'district') { s.player = { x: 1500, y: 580, direction: 'right' }; s.started = true; s.cleared = true; s.kills = 5; s.wave = 2; s.fragments = ['street', 'station']; s.hunt.phase = 'departed'; s.hunt.tickets = TICKETS.map(t => t.id) }
    return s
  })
  const gameRef = useRef(initialGame)
  const keysRef = useRef(new Set())
  const imagesRef = useRef({})
  const [initialCivilians] = useState(createCivilians)
  const civiliansRef = useRef(initialCivilians)
  const cameraRef = useRef({ x: 0, y: 195 })
  const [hud, setHud] = useState(() => ({ ...metroHud(initialGame), area: 'Ruas de Manhattan', objective: huntObjective(initialGame) }))
  const [assetError, setAssetError] = useState(false)
  const [dialogue, setDialogue] = useState(checkpoint === 'predator' ? STORIES.clear : { speaker: 'Margens de Vidro', text: 'A cidade retorna em pedaços: uma rua molhada, a entrada da Estação Raiz, o número 07-B. Siga a etiqueta luminosa ao norte e depois procure uma saída pela estação. Seu cajado agora pode lançar luz: F ou Espaço para atacar, E para examinar e Q para esquivar.' })
  const dialogueRef = useRef(dialogue)
  const show = useCallback(value => { dialogueRef.current = value; keysRef.current.clear(); setDialogue(value) }, [])
  const closeDialogue = useCallback(() => {
    keysRef.current.clear()
    if (gameRef.current.hunt.phase === 'dialogue') advanceHunterDialogue(gameRef.current)
    else show(null)
  }, [show])
  useEffect(() => {
    preloadPlayerRunSprites()
    let active = true
    for (const [key, src] of Object.entries(SPRITES)) {
      const image = new Image(); image.onload = () => { if (active) imagesRef.current[key] = image }; image.onerror = () => { if (active) setAssetError(true) }; image.src = src
    }
    return () => { active = false }
  }, [])
  const attack = useCallback(() => { if (!dialogueRef.current) castStaff(gameRef.current) }, [])
  const interact = useCallback(() => {
    if (gameRef.current.hunt.phase === 'dialogue') { closeDialogue(); return }
    if (dialogueRef.current) {
      if (!dialogueRef.current.options) show(null)
      return
    }
    const s = gameRef.current; const p = s.player
    if (huntLocked(s)) return
    if (beginBoarding(s) || boardReturnTrain(s)) { keysRef.current.clear(); return }
    const ticket = collectTicket(s)
    if (ticket) { if (!s.event) show({ speaker: ticket.name, text: `Ticket recuperado · ${s.hunt.tickets.length}/3. Continue procurando os tickets iluminados na plataforma.` }); return }
    if (s.hunt.phase === 'fight') { attack(); return }
    const memory = MEMORIES.find(m => !s.fragments.includes(m.id) && dist(p, m) < 65)
    if (memory) {
      if (memory.id === 'station' && !ticketsAvailable(s)) { show({ speaker: 'Gravador da plataforma', text: s.cleared ? 'O gravador precisa de energia. A porta do vagão se abriu ao norte: tente embarcar primeiro.' : 'As garras abafam a gravação. Enfraqueça as cinco mutações com o cajado antes de recuperar o registro.' }); return }
      s.fragments.push(memory.id); show({ speaker: memory.title, text: memory.text }); return
    }
    if (dist(p, CORE) < 90) {
      if (s.hunt.phase !== 'departed' || s.fragments.length < 3) { show({ speaker: 'Terminal 07-B', text: 'Faltam registros para compreender o sinal. Recupere as três memórias e liberte a plataforma.' }); return }
      show({ speaker: 'A Interferência', text: 'Você não era o único sujeito. Agora conhece o destino dos outros e pode encerrar a contenção. O que fará com a passagem entre os mundos?', options: [{ label: 'Selar a passagem e proteger o Vale', ending: 'vale' }, { label: 'Levar a verdade para a cidade', ending: 'truth' }, { label: 'Abrir um caminho seguro', ending: 'home' }], onChoose: option => onFinish(option.ending) }); return
    }
    // E also attacks in combat, preserving the familiar one-button touch action.
    if (s.enemies.some(e => e.hp > 0 && dist(p, e) < 340)) attack()
  }, [attack, onFinish, show, closeDialogue])
  const dodge = useCallback(() => { startBoost(playerAnimation.boost, gameRef.current.player, Boolean(dialogueRef.current) || huntLocked(gameRef.current)) }, [playerAnimation.boost])
  useEffect(() => {
    const down = event => {
      if (pause.current) return
      const key = event.key.toLowerCase()
      if (event.target instanceof HTMLElement && (event.target.closest('input, textarea, select') || event.target.closest('button') && [' ', 'enter'].includes(key))) return
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', 'f', ' '].includes(key)) event.preventDefault()
      if (!event.repeat && key === 'e') interact()
      if (!event.repeat && key === 'q') { event.preventDefault(); dodge() }
      if (key === 'f' || key === ' ') attack()
      keysRef.current.add(key)
    }
    const up = e => keysRef.current.delete(e.key.toLowerCase())
    const blur = () => keysRef.current.clear()
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur) }
  }, [attack, interact, dodge, pause])
  useEffect(() => {
    const c = canvasRef.current.getContext('2d'); let frame; let hudKey = ''
    const render = time => {
      const tick = clock.step(time, pause.current)
      if (!tick) { keysRef.current.clear(); frame = requestAnimationFrame(render); return }
      const dt = tick.delta; time = tick.time
      const s = gameRef.current; const keys = keysRef.current
      const before = { x: s.player.x, y: s.player.y }
      updateBoost(playerAnimation.boost, s.player, dt, point => validCombatPosition(point, s), Boolean(dialogueRef.current) || huntLocked(s))
      if (!dialogueRef.current) {
        if (keys.has('f') || keys.has(' ')) castStaff(s)
        updateCombat(s, dt, playerAnimation.boost.remaining ? { x: 0, y: 0 } : { x: Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft')), y: Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup')) })
        if (s.event) { const event = s.event; s.event = null; if (STORIES[event]) show(STORIES[event]) }
        updateCivilians(civiliansRef.current, dt, s.player, p => validActPosition(p, s.cleared))
      }
      updatePlayerAnimation(playerAnimation, before, s.player, dt, Boolean(dialogueRef.current) || s.hunt.phase === 'dialogue')
      const p = s.player; const camera = cameraRef.current; const ease = 1 - Math.exp(-7 * dt)
      const cinema = s.hunt.phase === 'cinematic' || s.hunt.phase === 'dialogue'
      const zoom = s.hunt.zoom
      const focus = cinema ? { x: 870, y: 430 } : p
      camera.x += (clamp(focus.x - 576 / zoom, 0, ACT_WORLD.width - 1152 / zoom) - camera.x) * ease
      camera.y += (clamp(focus.y - 324 / zoom, 0, ACT_WORLD.height - 648 / zoom) - camera.y) * ease
      c.clearRect(0, 0, 1152, 648); c.save(); c.scale(zoom, zoom); c.translate(-camera.x, -camera.y); drawActMap(c, time, s)
      drawMetroMarkers(c, s, time); drawPredatorTelegraph(c, s)
      const actors = [...civiliansRef.current.map(person => ({ y: person.y, draw: () => drawCivilian(c, person) })), ...s.enemies.filter(e => e.hp > 0).map(e => ({ y: e.y, draw: () => drawMutant(c, e, imagesRef.current.mutant, time) })), ...(s.hunt.boss ? [{ y: s.hunt.boss.y, draw: () => drawPredator(c, s, imagesRef.current.predator, time) }] : []), { y: p.y, draw: () => {
        c.save(); if (s.invulnerable && Math.sin(time / 65) > 0) c.globalAlpha = .4
        drawAnimatedPlayer(c, imagesRef.current, playerAnimation, p.x - 29, p.y - 67, 58, 73); c.restore()
      } }].sort((a, b) => a.y - b.y)
      actors.forEach(a => a.draw())
      for (const b of s.bolts) {
        c.save(); c.shadowColor = '#7dffff'; c.shadowBlur = 17; c.strokeStyle = '#92e5dd'; c.lineWidth = 5
        c.beginPath(); c.moveTo(b.x - b.dx * 23, b.y - 28 - b.dy * 23); c.lineTo(b.x, b.y - 28); c.stroke()
        c.fillStyle = '#f4ffd8'; c.fillRect(b.x - 3, b.y - 31, 6, 6); c.restore()
      }
      // Draw after all actors so the hero's health stays legible above the sprite.
      c.fillStyle = '#07131de8'; c.fillRect(p.x - 32, p.y - 91, 64, 12)
      c.fillStyle = '#46535a'; c.fillRect(p.x - 29, p.y - 88, 58, 6)
      c.fillStyle = s.health <= 2 ? '#ef876e' : '#b8d69b'; c.fillRect(p.x - 29, p.y - 88, 58 * s.health / MAX_HEALTH, 6)
      c.font = 'bold 10px monospace'; c.textAlign = 'center'; c.fillStyle = '#eef3da'; c.fillText(`${s.health}/${MAX_HEALTH}`, p.x, p.y - 96)
      drawGuide(c, s); c.restore(); drawSuspense(c, s)
      const area = p.x > 620 && p.x < 1400 && p.y >= 990 ? 'Estação Raiz • Plataforma 03 / Sul' : inStation(p) ? 'Estação Raiz • Plataforma 02' : p.x > 1400 ? 'Estação Raiz • Anexo 07-B' : p.y > 1040 ? 'W 08 St • Hudson' : 'Ruas de Manhattan'
      const nextHud = { ...metroHud(s), area, objective: huntObjective(s) }
      const nextKey = JSON.stringify(nextHud)
      if (nextKey !== hudKey) { hudKey = nextKey; setHud(nextHud) }
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render); return () => cancelAnimationFrame(frame)
  }, [show, playerAnimation, pause, clock])
  const setTouch = useCallback(direction => {
    ;['w', 'a', 's', 'd'].forEach(k => keysRef.current.delete(k))
    if (direction) keysRef.current.add({ up: 'w', down: 's', left: 'a', right: 'd' }[direction])
  }, [])
  const objective = hud.objective || (!hud.fragments.includes('street') ? 'Examine a etiqueta ao norte da rua principal.' : !hud.cleared ? 'Entre no metrô a leste e liberte a plataforma com o cajado.' : hud.fragments.length < 3 ? 'Recupere o gravador na plataforma e o registro no distrito.' : 'Siga ao terminal 07-B e decida o destino da passagem.')
  const cinematic = ['cinematic', 'dialogue', 'departing'].includes(hud.huntPhase)
  const hunterLine = hud.huntPhase === 'dialogue' ? HUNTER_LINES[hud.line] : null
  const visibleDialogue = hunterLine ? { ...hunterLine, portrait: hunterLine.speaker === 'O Predador' ? SPRITES.predator : null } : dialogue
  const blocked = Boolean(visibleDialogue) || ['cinematic', 'dying', 'departing'].includes(hud.huntPhase)
  return <main className="game-screen beyond-screen"><header className="game-header"><Brand /><div><span>Ato II</span><i /><strong>Os outros sujeitos</strong></div></header>
    <div className="game-stage"><section className={`canvas-shell metro-stage${cinematic ? ' metro-cinematic' : ''}`} aria-label="Ato II: ruas, metrô e Distrito 07-B"><canvas ref={canvasRef} width="1152" height="648" tabIndex={0} aria-label="Mapa jogável. WASD move, F ou Espaço dispara o cajado, E examina, Q esquiva." onPointerDown={e => e.currentTarget.focus()} />
      <div className="area-label"><span>Além do portão</span><strong>{hud.area}</strong></div>
      {['fight', 'dying'].includes(hud.huntPhase) && <div className="predator-hud" role="group" aria-label="Vida do Predador">
        <div><span>O PREDADOR</span><small>CONTRATO R-07 · FASE {hud.bossPhase}/3</small></div>
        {[0, 1, 2].map(i => <div className="predator-health" key={i} role="progressbar" aria-label={`Barra ${i + 1} do Predador`} aria-valuemin={0} aria-valuemax={BOSS_BAR_HP} aria-valuenow={clamp(hud.bossHp - i * BOSS_BAR_HP, 0, BOSS_BAR_HP)}><i style={{ width: `${clamp((hud.bossHp - i * BOSS_BAR_HP) / BOSS_BAR_HP, 0, 1) * 100}%` }} /></div>)}
        <p>F / Espaço · cajado <b>Q · esquiva</b></p>
      </div>}
      <GameHud>
      <MissionPanel className="act-two-objective" label={`Investigação 07-B · ${hud.fragments.length}/3`}><span>Investigação 07-B</span><strong>{hud.fragments.length}/3 memórias recuperadas</strong><p>{objective}</p></MissionPanel>
      <MissionPanel className="duel-status mutant-status" label="Combate e controles"><span>{hud.huntPhase === 'fight' ? 'Predador · garras de aço' : hud.cleared ? 'Mutações contidas' : hud.started ? `Mutações • encontro ${hud.wave}/2` : 'Cajado de luz'}</span><small>{hud.kills}/5 mutações contidas</small><p>F / Espaço: disparar<br />E: examinar • WASD: mover<br />Q: esquivar</p><button type="button" onClick={attack} disabled={blocked} aria-label="Disparar cajado">✦ Disparar cajado</button><button type="button" onClick={dodge} disabled={blocked} aria-label="Esquivar">↝ Esquivar · Q</button></MissionPanel>
      </GameHud>
      {assetError && <p className="act-asset-error" role="alert">Não foi possível carregar um sprite. Recarregue a página.</p>}
    </section></div><Dialogue dialogue={visibleDialogue} onClose={closeDialogue} /><TouchControls setTouch={setTouch} interact={interact} /></main>
}
