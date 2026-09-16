import { createPlayerAnimation, updatePlayerAnimation, preloadPlayerRunSprites, drawAnimatedPlayer } from './playerAnimation'
import { startBoost, updateBoost } from './playerBoost'
import { ruinShake } from './ruinBarrier'
import { preloadFragmentSprite } from './ruinFragments'
import { preloadUndeadSprites, drawUndeadHoles } from './ruinUndead'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { GameHud, HudItem as MissionPanel } from './ui/GameHud'
import { GameMenu } from './ui/GameMenu'
import { useGameClock, useGamePause } from './ui/gamePause'
import { woodlandTree, woodlandGround, healerCottage, clearingDetails, woodlandSigns } from './scenery'
import ActTwo from './ActTwo'
import { renderCabinInterior, cabinWalkable } from './cabinInterior'
import { drawVillage, villageWalkable, VILLAGE_OBJECTS, VILLAGE_START } from './village'
import { createVillagePopulation, updateVillagePopulation, villageInteraction, drawVillagePerson, drawVillageAnimal } from './villagePopulation'
import { drawFarmActivity } from './villageFarmArt'
import { GARDEN, eastRiverWalkable } from './villageLayout'
import { treeClearOfWater } from './waterClearance'
import { drawForestBorder, forestBorderWalkable } from './forestBorder'
import { createLakeFrogs, updateLakeFrogs, drawLakeFrog } from './lakeFrogs'
import { lakeWalkable, drawDetailedLake, drawStoneFire } from './lakeDetails'
import { RUIN_ALTAR, inRuinArena, ruinsWalkable, createRuinDuel, awakenRuin, castRuinLight, updateRuinDuel, drawRuins, drawRuinDuel } from './ruins'

const VIEW = { width: 1152, height: 648 }
const WORLD = { width: 2200, height: 2100 }
const PLAYER_START = { x: 335, y: 515 }
const FROG = { x: 310, y: 398 }
const GUARDIAN = { x: 1580, y: 730 }
const BRIDGE_LEVER = { x: 1668, y: 730 }
const EXIT = { x: 2105, y: 730 }
const MOVE_SPEED = 175

const PLAYER_SPRITES = {
  down: '/assets/ratoFrente.png',
  up: '/assets/ratoCostas.png',
  left: '/assets/ratoEsquerda.png',
  right: '/assets/ratoDireita.png',
}

const FROG_SPRITES = {
  down: '/assets/sapoFrente.png',
  up: '/assets/sapoCostas.png',
  left: '/assets/sapoEsquerda.png',
  right: '/assets/sapoDireita.png',
}

function buildForest() {
  const trees = []
  for (let row = 0; row < 11; row += 1) {
    for (let column = 0; column < 17; column += 1) {
      const x = 55 + column * 132 + ((row * 47 + column * 29) % 68)
      const y = 58 + row * 128 + ((row * 31 + column * 43) % 58)
      const radius = 22 + ((row * 17 + column * 13) % 15)
      const cabinClearing = x < 570 && y < 650
      const eastBridge = x > 1570 && y > 620 && y < 840
      const pathGap = Math.abs(y - (520 + x * .11)) < 78
      const landmarkGap = (x > 820 && x < 1120 && y > 650 && y < 970) || (x > 1160 && x < 1680 && y > 95 && y < 650) || Math.hypot(x - 650, y - 850) < 155
      const villageTrail = y > 950 && Math.abs(x - 1000) < 115
      if (!cabinClearing && !eastBridge && !pathGap && !landmarkGap && !villageTrail && treeClearOfWater(x, y, radius)) trees.push([x, y, radius])
    }
  }
  return trees
}

const TREES = buildForest()

const HERBS = [
  { id: 'herb-1', x: 650, y: 585, name: 'Erva-de-luar', memory: 'A folha se fecha na sua pata. Você ouve, por um segundo, a chuva batendo numa janela de laboratório.' },
  { id: 'herb-2', x: 1025, y: 970, name: 'Folha de âmbar', memory: 'Sob a folha há uma marca de pata minúscula. O Vale parece ter conhecido outros fugitivos.' },
  { id: 'herb-3', x: 1455, y: 405, name: 'Musgo estrelado', memory: 'O musgo pulsa num ritmo parecido com um coração. Uma voz baixa sussurra: “o portão não foi construído para separar mundos”.' },
]

const FIREFLIES = [
  { id: 'firefly-1', x: 590, y: 230, memory: 'A primeira luz pousa no frasco e projeta a silhueta de uma tartaruga sobre as folhas.' },
  { id: 'firefly-2', x: 1190, y: 705, memory: 'A luz foge da sua mão, depois retorna. Ela parece reconhecer o cheiro estranho que ainda vive no seu sangue.' },
  { id: 'firefly-3', x: 1550, y: 980, memory: 'Quando a última luz entra no frasco, uma névoa vermelha pulsa longe, onde o Vale encontra o rio.' },
]

const MEMORY_ECHOES = [
  { id: 'echo-rain', x: 790, y: 735, title: 'Eco da chuva', text: 'Uma poça reflete prédios impossíveis no meio da floresta. Por trás deles, uma sirene repete três notas — o mesmo som do laboratório.' },
  { id: 'echo-file', x: 1340, y: 292, title: 'Registro 07-B', text: 'Entre as ruínas, letras luminosas formam um fragmento: “Variação cognitiva estável. Sujeito escapou durante a contenção.”' },
  { id: 'echo-gate', x: 1615, y: 1040, title: 'Memória do portão', text: 'Uma raiz carrega a lembrança de alguém atravessando o portal antes de você. A voz do Curandeiro era muito mais jovem.' },
]


const QUESTS = [
  { eyebrow: 'Tarefa I', title: 'Remédio do vale', description: 'Encontre três ervas além da clareira. Elas crescem junto a trilhas, pedras e ruínas.', total: 3 },
  { eyebrow: 'Tarefa II', title: 'Luzes perdidas', description: 'Reúna três vaga-lumes. Procure reflexos onde a floresta fica mais silenciosa.', total: 3 },
  { eyebrow: 'Tarefa III', title: 'O selo do portão', description: 'Encontre o Guardião junto à ponte, resolva seu enigma e restaure o selo.', total: 1 },
]

const COMIC_PANELS = [
  { number: '01', place: 'Laboratório clandestino • Manhattan', time: '03:17', title: 'O despertar químico', text: 'Sob as ruas de Nova Iorque, animais eram submetidos a testes ilegais com compostos sintéticos. Marcado como uma variação genética sem valor, o pequeno rato despertou ouvindo os cientistas discutirem seu descarte. Pela primeira vez, ele compreendeu cada palavra — e compreendeu que precisava fugir.', className: 'lab' },
  { number: '02', place: 'Corredor de contenção • Setor 7-B', time: '03:24', title: 'A fuga', text: 'Durante a troca do turno noturno, o rato roeu as grades enfraquecidas da gaiola e alcançou o corredor de contenção. Ao fundo, quatro pequenas tartarugas flutuavam num aquário banhado por um composto mutagénico verde. Ele hesitou por um instante, mas o alarme vermelho obrigou-o a correr para a chuva.', className: 'escape' },
  { number: '03', place: 'Central Park • Nova Iorque', time: '03:38', title: 'O surto neural', text: 'A água gelada atravessou seu pelo quando ele chegou ao Central Park. As substâncias em seu sangue reagiram de uma só vez: milhares de novas conexões despertaram, trazendo linguagem, lógica e lembranças que não eram suas. A cidade ficou distante enquanto uma consciência humana nascia dentro de um corpo minúsculo.', className: 'rain' },
  { number: '04', place: 'Sob uma moita • Central Park', time: '03:41', title: 'Entre dois mundos', text: 'Tonto com pensamentos que ainda não sabia organizar, o rato caiu entre as raízes de uma árvore. Sua visão borrou; os candeeiros do parque se desprenderam da cidade e viraram pirilampos dourados. Antes de perder os sentidos, ele ouviu uma voz antiga chamando-o para um vale escondido.', className: 'dream' },
]

const LANDMARKS = [
  { x: 650, y: 850, label: 'Círculo de Pedras' },
  { x: 1395, y: 330, label: 'Ruínas Cobertas' },
  { x: 1410, y: 1110, label: 'Lago dos Sussurros' },
]

const AREA_ZONES = [
  { test: (x, y) => x >= 1740 && y > 1540, name: 'Vila das Lanternas • Fazenda' },
  { test: (x, y) => x < 1740 && y > 1540, name: 'Vila das Lanternas' },
  { test: (x, y) => x < 1740 && y > 1370, name: 'Riacho das Lanternas' },
  { test: (x, y) => x < 600 && y < 660, name: 'Clareira do Curandeiro' },
  { test: (x, y) => x > 1260 && y > 900, name: 'Lago dos Sussurros' },
  { test: (x) => x > 1640, name: 'Margem do Rio do Leste' },
  { test: (x, y) => x > 1120 && y < 620, name: 'Bosque das Ruínas' },
]

const CABIN_FROG = { x: 880, y: 300 }
const CABIN_START = { x: 405, y: 500 }
const CABIN_EXIT = { x: 576, y: 555 }
const CABIN_OBJECTS = [
  { id: 'shelf', x: 205, y: 234, label: 'Estante de ervas', text: 'Frascos de raízes, folhas e sementes ocupam cada espaço. Alguns nomes estão escritos numa língua que você estranhamente consegue ler.' },
  { id: 'map', x: 548, y: 212, label: 'Mapa do Vale', text: 'O mapa mostra a cabana, um lago, ruínas e uma ponte a leste. Além do portão, o pergaminho está completamente em branco.' },
  { id: 'workbench', x: 720, y: 280, label: 'Mesa do Curandeiro', text: 'Um pilão ainda guarda pó de pétalas azuladas. Há um pergaminho com uma receita interrompida e uma vela que parece não diminuir nunca.' },
  { id: 'bench', x: 440, y: 343, label: 'Banco de viagem', text: 'Botas pequenas, uma bolsa de couro e marcas profundas na madeira. Alguém passou muitas noites preparando partidas e esperando retornos.' },
  { id: 'chest', x: 955, y: 565, label: 'Baú antigo', text: 'Dentro há um pequeno manto, um frasco vazio e um cajado do tamanho exato para suas patas.' },
  { id: 'window', x: 748, y: 230, label: 'Janela', text: 'Lá fora, folhas âmbar flutuam sem vento. Por um instante, você acredita enxergar as luzes de Nova Iorque entre as árvores.' },
]

const FROG_QUESTIONS = {
  identity: { label: 'Quem é você?', answer: 'Chamam-me de Curandeiro. Encontrei você inconsciente sob as raízes, encharcado por uma chuva que não caiu neste Vale.' },
  place: { label: 'Onde estou?', answer: 'Num lugar escondido entre caminhos. Alguns chegam aqui procurando abrigo; outros chegam quando sua mente precisa compreender uma mudança.' },
  return: { label: 'Como volto para casa?', answer: 'A ponte do leste leva ao portão, mas seu selo se partiu. Ajude o Vale e o caminho talvez reconheça aquilo que despertou dentro de você.' },
}

const STORY_PATHS = {
  vale: {
    label: 'Proteger o Vale',
    title: 'Guardião em formação',
    icon: '✦',
    description: 'Você decidiu retribuir o abrigo que recebeu. Os habitantes do Vale passarão a confiar mais em você.',
    frog: 'Então caminhe com cuidado. O Vale percebe quem escolhe permanecer quando seria mais fácil seguir em frente.',
    objective: 'Cuide do que o Vale confiou a você.',
  },
  home: {
    label: 'Encontrar o caminho de casa',
    title: 'Viajante entre mundos',
    icon: '↗',
    description: 'Você não esqueceu a cidade. Cada pista pode aproximá-lo da chuva, das ruas e da origem de sua mudança.',
    frog: 'Saudade não é fraqueza, pequeno viajante. Ela pode ser uma bússola, desde que você não a deixe apagar o caminho sob seus pés.',
    objective: 'Siga qualquer sinal que aponte para o outro mundo.',
  },
  truth: {
    label: 'Descobrir a verdade',
    title: 'Investigador do impossível',
    icon: '◇',
    description: 'Você quer entender o laboratório, a mutação e por que o Vale o chamou antes de decidir a que mundo pertence.',
    frog: 'Perguntas podem abrir portas que estavam seguras por séculos. Se escolher a verdade, esteja pronto para carregá-la.',
    objective: 'Leia os sinais que outros preferem esconder.',
  },
}

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

function loadImages(paths, onReady) {
  const images = {}
  let loaded = 0
  Object.entries(paths).forEach(([key, src]) => {
    const image = new Image()
    image.onload = () => {
      images[key] = image
      loaded += 1
      if (loaded === Object.keys(paths).length) onReady(images)
    }
    image.src = src
  })
}

function PrimaryButton({ children, onClick }) {
  return <button className="primary-button" onClick={onClick}>{children}<span aria-hidden="true">→</span></button>
}

function Brand() {
  return <div className="brand"><span>O segredo do</span><strong>Vale</strong></div>
}

function Home({ onStart }) {
  return (
    <main className="home-screen">
      <div className="home-vignette" />
      <header className="home-header"><span>Arquivo 07-B • Nova Iorque</span><span>Uma fábula interativa</span></header>
      <section className="home-copy">
        <p className="kicker">Uma história sobre memória e consciência</p>
        <p className="home-intro">Toda floresta guarda<br />um caminho que não aparece<br />nos mapas.</p>
        <p>Ajude um pequeno fugitivo a seguir as luzes,<br />atravessar o Vale e descobrir quem se tornou.</p>
        <PrimaryButton onClick={onStart}>Iniciar história</PrimaryButton>
      </section>
      <div className="home-controls"><kbd>WASD</kbd><span>ou</span><kbd>SETAS</kbd><span>para andar</span><i /><kbd>E</kbd><span>ou</span><kbd>ESPAÇO</kbd><span>para interagir</span></div>
    </main>
  )
}

function Prologue({ onContinue }) {
  const [page, setPage] = useState(0)
  const [visibleWords, setVisibleWords] = useState(0)
  const panel = COMIC_PANELS[page]
  const words = useMemo(() => panel.text.split(' '), [panel.text])
  const finished = visibleWords >= words.length

  const revealOrAdvance = useCallback(() => {
    if (!finished) { setVisibleWords(words.length); return }
    if (page === COMIC_PANELS.length - 1) onContinue()
    else { setPage((current) => current + 1); setVisibleWords(0) }
  }, [finished, onContinue, page, words.length])

  useEffect(() => {
    if (finished) return undefined
    const timer = window.setTimeout(() => setVisibleWords((current) => current + 1), 115)
    return () => window.clearTimeout(timer)
  }, [finished, visibleWords])

  useEffect(() => {
    const handleKey = (event) => {
      if (event.target instanceof HTMLButtonElement) return
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); revealOrAdvance() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [revealOrAdvance])

  return (
    <main className="story-screen">
      <header className="story-header">
        <Brand />
        <div className="story-progress"><span>Prólogo</span><strong>{String(page + 1).padStart(2, '0')} / {String(COMIC_PANELS.length).padStart(2, '0')}</strong></div>
      </header>
      <section className="comic-stage" aria-label={`Quadro ${page + 1} de ${COMIC_PANELS.length}`}>
        <article className={`comic-panel ${panel.className}`} onClick={() => !finished && setVisibleWords(words.length)}>
          <div className="panel-art" />
          <div className="panel-grain" />
          <span className="panel-number">{panel.number}</span>
          <div className="panel-location"><span>{panel.place}</span><strong>{panel.time}</strong></div>
          <div className="panel-caption">
            <small>Arquivo {panel.number} • memória fragmentada</small>
            <h2>{panel.title}</h2>
            <i />
            <p>{words.slice(0, visibleWords).join(' ')}{!finished && <span className="typing-caret" />}</p>
          </div>
          {!finished && <button className="skip-line" onClick={(event) => { event.stopPropagation(); setVisibleWords(words.length) }}>Pular fala</button>}
        </article>
      </section>
      <footer className="story-footer">
        <div className="story-dots">{COMIC_PANELS.map((_, index) => <i className={index === page ? 'active' : index < page ? 'read' : ''} key={index} />)}</div>
        <p>{finished ? 'A memória se estabilizou.' : 'Clique ou pressione espaço para revelar a fala.'}</p>
        <div className="story-actions">
          {page > 0 && <button className="back-button" onClick={() => { setPage((current) => current - 1); setVisibleWords(0) }}>Anterior</button>}
          {finished && <PrimaryButton onClick={revealOrAdvance}>{page === COMIC_PANELS.length - 1 ? 'Despertar no vale' : 'Próximo quadro'}</PrimaryButton>}
        </div>
      </footer>
    </main>
  )
}

function drawTree(ctx, x, y, radius, index) {
  woodlandTree(ctx, x, y, radius, index)
}

function drawCabin(ctx, time) {
  healerCottage(ctx, time)
}

function drawGuardian(ctx, time) {
  ctx.save(); ctx.translate(GUARDIAN.x, GUARDIAN.y)
  ctx.fillStyle = 'rgba(17, 12, 8, .4)'; ctx.beginPath(); ctx.ellipse(5, 25, 31, 13, 0, 0, Math.PI * 2); ctx.fill()
  const stone = ctx.createLinearGradient(-22, -48, 24, 28)
  stone.addColorStop(0, '#8c866c'); stone.addColorStop(.48, '#595b4c'); stone.addColorStop(1, '#333b35')
  ctx.fillStyle = stone; ctx.beginPath(); ctx.moveTo(-20, 25); ctx.lineTo(-17, -25); ctx.lineTo(-9, -43); ctx.lineTo(9, -43); ctx.lineTo(18, -25); ctx.lineTo(22, 25); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#26372e'; ctx.beginPath(); ctx.arc(-8, -26, 3, 0, Math.PI * 2); ctx.arc(8, -26, 3, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#c48835'; ctx.lineWidth = 2; ctx.globalAlpha = .65 + Math.sin(time / 300) * .2
  ctx.beginPath(); ctx.arc(0, -5, 9, 0, Math.PI * 2); ctx.moveTo(-7, -11); ctx.lineTo(7, 1); ctx.moveTo(7, -11); ctx.lineTo(-7, 1); ctx.stroke()
  ctx.globalAlpha = 1; ctx.fillStyle = '#738052'; ctx.beginPath(); ctx.arc(-16, 1, 5, 0, Math.PI * 2); ctx.arc(15, 12, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore()
}

function drawLandmarks(ctx, time) {
  drawRuins(ctx, time)

  drawDetailedLake(ctx, time)
  drawStoneFire(ctx, time)

  ctx.fillStyle = '#d7c99d'; ctx.font = '600 13px Georgia'; ctx.textAlign = 'center'; ctx.globalAlpha = .72
  ctx.globalAlpha = 1
}

function drawMap(ctx, time, bridgeOpen) {
  const { width, height } = WORLD
  woodlandGround(ctx, width, height)
  clearingDetails(ctx)

  ctx.fillStyle = '#172d2d'; ctx.fillRect(1760, 0, 120, height)
  ctx.strokeStyle = '#365456'; ctx.lineWidth = 3; ctx.globalAlpha = .55
  for (let y = -20; y < height; y += 25) { ctx.beginPath(); ctx.moveTo(1768, y); ctx.bezierCurveTo(1798, y + 11, 1840, y - 10, 1872, y + 3); ctx.stroke() }
  ctx.globalAlpha = 1

  drawCabin(ctx, time)
  drawLandmarks(ctx, time)
  TREES.forEach((tree, index) => drawTree(ctx, ...tree, index))
  drawVillage(ctx, time)
  drawForestBorder(ctx)
  woodlandSigns(ctx)
  drawGuardian(ctx, time)

  ctx.save(); ctx.translate(1820, 730)
  const drawBridgeSection = (start, end) => {
    ctx.fillStyle = '#3a2312'; ctx.fillRect(start, -92, end - start, 184)
    ctx.fillStyle = '#8a5b2e'
    for (let x = start + 5; x < end - 5; x += 18) { ctx.fillRect(x, -86, 14, 172); ctx.fillStyle = '#c0934f'; ctx.fillRect(x + 2, -83, 10, 2); ctx.fillStyle = '#8a5b2e' }
    ctx.strokeStyle = '#c0934f'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(start, -87); ctx.lineTo(end, -87); ctx.moveTo(start, 87); ctx.lineTo(end, 87); ctx.stroke()
  }
  if (bridgeOpen) drawBridgeSection(-132, 132)
  else { drawBridgeSection(-132, -48); drawBridgeSection(48, 132) }
  ctx.restore()

  ctx.fillStyle = bridgeOpen ? '#d97706' : '#322219'; ctx.fillRect(BRIDGE_LEVER.x - 7, BRIDGE_LEVER.y - 20, 14, 40)
  ctx.fillStyle = '#f4e8c1'; ctx.beginPath(); ctx.arc(BRIDGE_LEVER.x, BRIDGE_LEVER.y - 22, 8, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = '#392518'; ctx.fillRect(2080, 670, 11, 125); ctx.fillRect(2143, 670, 11, 125)
  ctx.fillStyle = '#4a2e6d'; ctx.beginPath(); ctx.moveTo(2071, 681); ctx.lineTo(2163, 681); ctx.lineTo(2144, 640); ctx.lineTo(2092, 640); ctx.closePath(); ctx.fill()

  ctx.fillStyle = '#f4e8c1'; ctx.font = '600 13px Georgia'; ctx.textAlign = 'center'; ctx.globalAlpha = .8
  ctx.globalAlpha = 1

  if (!bridgeOpen) {
    const pulse = .5 + Math.sin(time / 350) * .18
    ctx.fillStyle = `rgba(217, 119, 6, ${pulse})`; ctx.beginPath(); ctx.arc(BRIDGE_LEVER.x, BRIDGE_LEVER.y - 22, 15, 0, Math.PI * 2); ctx.fill()
  }
}

function drawHerb(ctx, herb, time) {
  ctx.save(); ctx.translate(herb.x, herb.y + Math.sin(time / 500 + herb.x) * 2)
  ctx.strokeStyle = '#26351c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -7); ctx.stroke()
  ctx.fillStyle = '#9bb85c'
  ;[[-7, -5], [7, -1], [-5, 4]].forEach(([x, y]) => { ctx.beginPath(); ctx.ellipse(x, y, 8, 4, x < 0 ? -.5 : .5, 0, Math.PI * 2); ctx.fill() })
  ctx.fillStyle = '#efe0a3'; ctx.beginPath(); ctx.arc(1, -9, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore()
}

function drawFirefly(ctx, firefly, time) {
  const x = firefly.x + Math.sin(time / 520 + firefly.y) * 9
  const y = firefly.y + Math.cos(time / 430 + firefly.x) * 7
  const glow = ctx.createRadialGradient(x, y, 0, x, y, 25)
  glow.addColorStop(0, 'rgba(255, 224, 105, .95)'); glow.addColorStop(.2, 'rgba(217, 119, 6, .55)'); glow.addColorStop(1, 'rgba(217, 119, 6, 0)')
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff2a7'; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill()
}

function drawLighting(ctx, player, frog, time) {
  ctx.save(); ctx.globalCompositeOperation = 'screen'
  ;[[player.x, player.y - 12, 178 + Math.sin(time / 500) * 2, .16], [frog.x, frog.y - 18, 112, .09]].forEach(([x, y, r, alpha]) => {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r)
    glow.addColorStop(0, `rgba(255, 220, 130, ${alpha})`)
    glow.addColorStop(.35, `rgba(245, 178, 62, ${alpha * .48})`)
    glow.addColorStop(1, 'rgba(217, 119, 6, 0)')
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }); ctx.restore()
}

function drawValleyAtmosphere(ctx, time, narrative, threat) {
  ctx.save()
  const mood = narrative?.path === 'vale' ? [116, 177, 89] : narrative?.path === 'truth' ? [83, 166, 190] : [211, 143, 70]
  ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(${mood[0]}, ${mood[1]}, ${mood[2]}, .045)`; ctx.fillRect(0, 0, VIEW.width, VIEW.height)
  for (let i = 0; i < 26; i += 1) {
    const x = (i * 97 + time / (24 + i % 5)) % VIEW.width; const y = (i * 59 + Math.sin(time / 600 + i) * 22) % VIEW.height
    ctx.fillStyle = i % 3 ? 'rgba(238, 184, 82, .26)' : `rgba(${mood[0]}, ${mood[1]}, ${mood[2]}, .32)`; ctx.save(); ctx.translate(x, y); ctx.rotate(i + time / 4000); ctx.fillRect(-3, -1, 6, 2); ctx.restore()
  }
  if (threat) {
    const alpha = .025 * threat + Math.max(0, Math.sin(time / 900)) * .018
    const red = ctx.createRadialGradient(VIEW.width * .78, VIEW.height * .2, 0, VIEW.width * .78, VIEW.height * .2, 510)
    red.addColorStop(0, `rgba(178, 38, 33, ${alpha * 2.7})`); red.addColorStop(1, 'rgba(90, 14, 18, 0)')
    ctx.fillStyle = red; ctx.fillRect(0, 0, VIEW.width, VIEW.height)
  }
  ctx.restore()
}


function drawMinimap(ctx, player, game) {
  const width = 210; const height = 132
  const scaleX = width / WORLD.width; const scaleY = height / WORLD.height
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#263529'; ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#183033'; ctx.fillRect(1760 * scaleX, 0, 120 * scaleX, height)
  ctx.strokeStyle = '#9f7540'; ctx.lineWidth = 1.5; ctx.globalAlpha = .55
  ctx.beginPath(); ctx.moveTo(310 * scaleX, 510 * scaleY); ctx.bezierCurveTo(760 * scaleX, 565 * scaleY, 1250 * scaleX, 800 * scaleY, 1715 * scaleX, 730 * scaleY); ctx.stroke(); ctx.globalAlpha = 1
  ctx.fillStyle = '#d7b46b'; ctx.fillRect(225 * scaleX, 160 * scaleY, 170 * scaleX, 170 * scaleY)
  ctx.fillStyle = '#3a2312'; ctx.font = 'bold 12px Georgia'; ctx.textAlign = 'center'; ctx.fillText('⌂', 310 * scaleX, 250 * scaleY)
  ctx.fillStyle = '#a79263'
  LANDMARKS.forEach((landmark) => { ctx.beginPath(); ctx.arc(landmark.x * scaleX, landmark.y * scaleY, 3, 0, Math.PI * 2); ctx.fill() })
  ctx.fillStyle = '#e5c581'; ctx.fillRect(950 * scaleX, 1710 * scaleY, 12, 9)
  ctx.font = 'bold 8px sans-serif'; ctx.fillText('VILA', 1040 * scaleX, 1910 * scaleY)
  ctx.fillStyle = '#8db55f'; ctx.beginPath(); ctx.arc(FROG.x * scaleX, FROG.y * scaleY, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#17251c'; ctx.font = 'bold 7px sans-serif'; ctx.fillText('S', FROG.x * scaleX, FROG.y * scaleY + 2.5)
  if (game.stage === 0) {
    ctx.fillStyle = '#d6d37a'; HERBS.filter((item) => !game.herbs.includes(item.id)).forEach((item) => { ctx.beginPath(); ctx.arc(item.x * scaleX, item.y * scaleY, 2.3, 0, Math.PI * 2); ctx.fill() })
  }
  if (game.stage === 1) {
    ctx.fillStyle = '#ffd66e'; FIREFLIES.filter((item) => !game.fireflies.includes(item.id)).forEach((item) => { ctx.beginPath(); ctx.arc(item.x * scaleX, item.y * scaleY, 2.3, 0, Math.PI * 2); ctx.fill() })
  }
  ctx.fillStyle = '#8f68b5'; ctx.beginPath(); ctx.arc(GUARDIAN.x * scaleX, GUARDIAN.y * scaleY, 3, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#f4e8c1'; ctx.lineWidth = 2; ctx.strokeRect(1810 * scaleX, 704 * scaleY, 32 * scaleX, 52 * scaleY)
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(player.x * scaleX, player.y * scaleY, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#4a2e6d'; ctx.font = 'bold 7px sans-serif'; ctx.fillText('R', player.x * scaleX, player.y * scaleY + 2.5)
  ctx.strokeStyle = '#4a2e6d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(player.x * scaleX, player.y * scaleY, 6, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = '#b99a61'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, width - 2, height - 2)
}

function validPosition(next, bridgeOpen) {
  if (!forestBorderWalkable(next)) return false
  if (!ruinsWalkable(next)) return false
  if (!lakeWalkable(next)) return false
  if (!villageWalkable(next)) return false
  if (next.x < 22 || next.x > WORLD.width - 22 || next.y < 28 || next.y > WORLD.height - 24) return false
  if (TREES.some(([x, y, radius]) => Math.hypot(next.x - x, next.y - (y + 12)) < radius + 12)) return false
  if (next.x > 205 && next.x < 405 && next.y > 145 && next.y < 335) return false
  if (!eastRiverWalkable(next, bridgeOpen)) return false
  return true
}

function QuestCard({ stage, counts }) {
  const quest = QUESTS[stage]
  const value = counts[stage]
  return (
    <MissionPanel className="quest-card" label={`${quest.title} · ${value}/${quest.total}`}>
      <p>{quest.eyebrow}</p><h2>{quest.title}</h2><span className="ornament">◆</span><p>{quest.description}</p>
      <div className="quest-progress"><div><span style={{ width: `${(value / quest.total) * 100}%` }} /></div><strong>{value}/{quest.total}</strong></div>
    </MissionPanel>
  )
}

function Dialogue({ dialogue, onClose }) {
  if (!dialogue) return null
  return (
    <div className="dialogue" role="dialog" aria-live="polite">
      <div className={`dialogue-portrait${dialogue.guardian ? ' stone' : ''}${dialogue.portrait ? ' predator-portrait' : ''}`} style={dialogue.portrait ? { backgroundImage: `url(${dialogue.portrait})` } : undefined}>{dialogue.portrait ? null : dialogue.guardian ? <strong>◇</strong> : <img src={dialogue.frog ? FROG_SPRITES.down : PLAYER_SPRITES.down} alt="" />}</div>
      <div><span>{dialogue.speaker}</span><p>{dialogue.text}</p>{dialogue.options && <div className="dialogue-options">{dialogue.options.map((option) => <button key={option.label} onClick={() => dialogue.onChoose(option)}>{option.label}</button>)}</div>}</div>
      {!dialogue.options && <button onClick={onClose}>Continuar <kbd>E</kbd></button>}
    </div>
  )
}

function TouchControls({ setTouch, interact }) {
  const bind = (direction) => ({
    onPointerDown: (event) => { event.currentTarget.setPointerCapture(event.pointerId); setTouch(direction) },
    onPointerUp: () => setTouch(null), onPointerCancel: () => setTouch(null), onPointerLeave: () => setTouch(null),
  })
  return <div className="touch-controls"><div className="dpad"><button {...bind('up')}>▲</button><button {...bind('left')}>◀</button><i /><button {...bind('right')}>▶</button><button {...bind('down')}>▼</button></div><button className="touch-action" onClick={interact}>E<span>agir</span></button></div>
}

function drawCabinInterior(ctx, time, narrative, inspected) {
  renderCabinInterior(ctx, time, narrative, inspected)
}

function validCabinPosition(next) {
  return cabinWalkable(next)
}

function CabinPrelude({ narrative, onSetNarrative, onChooseMission }) {
  const pause = useGamePause()
  const clock = useGameClock()
  const canvasRef = useRef(null)
  const imagesRef = useRef(null)
  const keysRef = useRef(new Set())
  const [playerAnimation] = useState(createPlayerAnimation)
  const playerRef = useRef({ ...CABIN_START, direction: 'down' })
  const dialogueRef = useRef(null)
  const [dialogue, setDialogue] = useState({ speaker: 'Pensamento', text: 'Madeira quente. Cheiro de ervas. A última coisa de que me lembro é a chuva — mas este lugar não é o Central Park.' })
  const [asked, setAsked] = useState([])
  const [inspected, setInspected] = useState([])

  useEffect(() => { dialogueRef.current = dialogue }, [dialogue])

  const chooseQuestion = useCallback((option) => {
    if (option.mission !== undefined) { onChooseMission(option.mission); return }
    if (option.path) {
      const path = STORY_PATHS[option.path]
      onSetNarrative({ path: option.path, ...path })
      setDialogue({ speaker: 'Sapo Curandeiro', frog: true, text: path.frog })
      return
    }
    const question = FROG_QUESTIONS[option.key]
    setAsked((current) => current.includes(option.key) ? current : [...current, option.key])
    setDialogue({ speaker: 'Sapo Curandeiro', frog: true, text: question.answer })
  }, [onChooseMission, onSetNarrative])

  const interact = useCallback(() => {
    if (dialogueRef.current) { setDialogue(null); return }
    const player = playerRef.current
    if (distance(player, CABIN_EXIT) < 74) {
      if (asked.length < Object.keys(FROG_QUESTIONS).length) {
        setDialogue({ speaker: 'Pensamento', text: 'A porta está entreaberta, mas ainda preciso entender por que vim parar neste Vale. O Curandeiro pode me ajudar.' })
      } else if (!narrative) {
        setDialogue({ speaker: 'Pensamento', text: 'Ainda não sei por que caminho quero ser lembrado. Preciso falar mais uma vez com o Curandeiro.' })
      } else {
        setDialogue({
          speaker: 'Pensamento', text: 'O ar fresco do Vale me chama. Por onde começo?',
          options: [
            { label: 'Buscar 3 ervas', mission: 0 },
            { label: 'Procurar 3 pirilampos', mission: 1 },
          ], onChoose: chooseQuestion,
        })
      }
      return
    }
    if (distance(player, CABIN_FROG) < 66) {
      const remaining = Object.entries(FROG_QUESTIONS).filter(([key]) => !asked.includes(key))
      if (remaining.length) {
        setDialogue({
          speaker: 'Sapo Curandeiro', frog: true,
          text: asked.length ? 'Ainda há perguntas em seus olhos. O que mais deseja saber?' : 'Devagar, pequeno viajante. Você está seguro em minha casa. Pergunte o que precisar.',
          options: remaining.map(([key, value]) => ({ key, label: value.label })), onChoose: chooseQuestion,
        })
      } else if (!narrative) {
        setDialogue({
          speaker: 'Sapo Curandeiro', frog: true,
          text: 'Antes de sair, dê um nome ao que o trouxe até aqui. Essa escolha não fecha portas — mas fará o Vale responder de um jeito diferente.',
          options: Object.entries(STORY_PATHS).map(([path, value]) => ({ path, label: value.label })), onChoose: chooseQuestion,
        })
      } else {
        setDialogue({ speaker: 'Sapo Curandeiro', frog: true, text: `Você segue como ${narrative.title.toLowerCase()}. A casa guardará sua intenção até a sua volta.` })
      }
      return
    }
    const object = CABIN_OBJECTS.find((item) => distance(player, item) < 62)
    if (object) {
      setInspected((current) => current.includes(object.id) ? current : [...current, object.id])
      const tailoredText = object.id === 'map' && narrative?.path === 'truth'
        ? `${object.text} O ponto sem nome agora pulsa em azul, como se tivesse respondido à sua decisão.`
        : object.id === 'workbench' && narrative?.path === 'vale'
          ? `${object.text} O chá verde no fogo baixo exala um cheiro familiar: a casa já está preparando algo para quem você pretende proteger.`
          : object.id === 'bench' && narrative?.path === 'home'
            ? `${object.text} O manto de viagem separado sobre o banco tem o seu tamanho. O Curandeiro esperava que você quisesse partir.`
            : object.text
      setDialogue({ speaker: object.label, text: tailoredText })
      return
    }
    setDialogue({ speaker: 'Pensamento', text: 'As tábuas rangem suavemente. Cada objeto aqui parece ter sido colocado à espera de minha chegada.' })
  }, [asked, chooseQuestion, narrative])

  useEffect(() => {
    preloadPlayerRunSprites()
    loadImages({ ...Object.fromEntries(Object.entries(PLAYER_SPRITES).map(([key, value]) => [`player-${key}`, value])), frog: FROG_SPRITES.down }, (images) => { imagesRef.current = images })
    const down = (event) => {
      if (pause.current) return
      if (event.target instanceof HTMLElement && event.target.closest('button, input, textarea, select')) return
      const key = event.key.toLowerCase()
      if (key === 'q' && !event.repeat) { event.preventDefault(); startBoost(playerAnimation.boost, playerRef.current, Boolean(dialogueRef.current)) }
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', ' '].includes(key)) event.preventDefault()
      if ((key === 'e' || key === ' ') && !event.repeat) interact()
      keysRef.current.add(key)
    }
    const up = (event) => keysRef.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [interact, playerAnimation.boost, pause])

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    let frame
    const render = (time) => {
      const tick = clock.step(time, pause.current)
      if (!tick) { keysRef.current.clear(); frame = requestAnimationFrame(render); return }
      const delta = tick.delta; time = tick.time
      const keys = keysRef.current; const player = playerRef.current
      const before = { x: player.x, y: player.y }
      if (!dialogueRef.current) {
        let dx = 0; let dy = 0
        if (keys.has('a') || keys.has('arrowleft')) dx -= 1
        if (keys.has('d') || keys.has('arrowright')) dx += 1
        if (keys.has('w') || keys.has('arrowup')) dy -= 1
        if (keys.has('s') || keys.has('arrowdown')) dy += 1
        if ((dx || dy) && !playerAnimation.boost.remaining) {
          const length = Math.hypot(dx, dy); dx /= length; dy /= length
          player.direction = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down')
          const nextX = { ...player, x: player.x + dx * MOVE_SPEED * delta }
          if (validCabinPosition(nextX)) player.x = nextX.x
          const nextY = { ...player, y: player.y + dy * MOVE_SPEED * delta }
          if (validCabinPosition(nextY)) player.y = nextY.y
        }
      }
      updateBoost(playerAnimation.boost, player, delta, validCabinPosition, Boolean(dialogueRef.current))
      updatePlayerAnimation(playerAnimation, before, player, delta, Boolean(dialogueRef.current))
      drawCabinInterior(ctx, time, narrative, inspected)
      if (imagesRef.current) {
        ctx.drawImage(imagesRef.current.frog, CABIN_FROG.x - 42, CABIN_FROG.y - 61, 84, 75)
        drawAnimatedPlayer(ctx, imagesRef.current, playerAnimation, player.x - 28, player.y - 63, 56, 70, 'player-')
      }
      const near = distance(player, CABIN_EXIT) < 74 || distance(player, CABIN_FROG) < 66 || CABIN_OBJECTS.some((item) => distance(player, item) < 62)
      if (!dialogueRef.current && near) canvasRef.current.dataset.prompt = 'true'; else delete canvasRef.current.dataset.prompt
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [inspected, narrative, playerAnimation, pause, clock])

  const setTouch = useCallback((direction) => {
    ;['w', 'a', 's', 'd'].forEach((key) => keysRef.current.delete(key))
    if (direction) keysRef.current.add({ up: 'w', down: 's', left: 'a', right: 'd' }[direction])
  }, [])

  return (
    <main className="game-screen cabin-screen">
      <header className="game-header"><Brand /><div><span>Interior da cabana</span><i /><strong>Primeiro despertar</strong></div></header>
      <div className="game-stage">
        <section className="canvas-shell cabin-shell" aria-label="Interior explorável da cabana do Sapo">
          <GameHud>
          <canvas ref={canvasRef} width={VIEW.width} height={VIEW.height} />
          {!dialogue && <div className="interaction-hint"><kbd>E</kbd><span>interagir</span></div>}
          <MissionPanel className="cabin-objective" label="Antes de partir"><span>Antes de partir</span><strong>{narrative ? narrative.objective : 'Converse com o Sapo sobre as três perguntas'}</strong><small>Saída: porta iluminada ao sul • {asked.length}/3 respostas • {narrative ? 'intenção definida' : 'escolha seu rumo'}</small></MissionPanel>
          <MissionPanel className="cabin-journal" label="Base do Curandeiro"><span>Base do Curandeiro</span><strong>{narrative ? narrative.title : 'Memória em formação'}</strong><p>{narrative ? narrative.description : 'Cada objeto examinado ajuda a tornar esta casa um lugar seu.'}</p><div><i>{narrative?.icon || '○'}</i><small>Memórias encontradas <b>{inspected.length}/{CABIN_OBJECTS.length}</b></small></div></MissionPanel>
          </GameHud>
        </section>
      </div>
      <Dialogue dialogue={dialogue} onClose={() => setDialogue(null)} />
      <TouchControls setTouch={setTouch} interact={interact} />
    </main>
  )
}

function Gameplay({ onFinish, initialMission, narrative, villageStart = false, farmStart = false, ruinsStart = false }) {
  const pause = useGamePause()
  const clock = useGameClock()
  const [playerAnimation] = useState(createPlayerAnimation)
  const [population] = useState(createVillagePopulation)
  const [lakeFrogs] = useState(createLakeFrogs)
  const [ruinDuel] = useState(createRuinDuel)
  const [ruinHud, setRuinHud] = useState('dormant')
  const golemRef = useRef(null)
  const canvasRef = useRef(null)
  const minimapRef = useRef(null)
  const imagesRef = useRef(null)
  const keysRef = useRef(new Set())
  const playerRef = useRef({ ...(farmStart ? { x: 1980, y: 1795 } : ruinsStart ? { ...RUIN_ALTAR, y: RUIN_ALTAR.y + 42 } : villageStart ? VILLAGE_START : PLAYER_START), direction: 'down' })
  const cameraRef = useRef({ x: 0, y: 245 })
  const stateRef = useRef({ stage: initialMission, herbs: [], fireflies: [], herbsDone: false, firefliesDone: false, seal: false, bridgeOpen: false, echoes: [], tonic: false, threat: 0, trust: narrative?.path === 'vale' ? 2 : 1 })
  const [stage, setStage] = useState(initialMission)
  const [herbs, setHerbs] = useState([])
  const [fireflies, setFireflies] = useState([])
  const [herbsDone, setHerbsDone] = useState(false)
  const [firefliesDone, setFirefliesDone] = useState(false)
  const [seal, setSeal] = useState(false)
  const [bridgeOpen, setBridgeOpen] = useState(false)
  const [echoes, setEchoes] = useState([])
  const [tonic, setTonic] = useState(false)
  const [threat, setThreat] = useState(0)
  const [trust, setTrust] = useState(narrative?.path === 'vale' ? 2 : 1)
  const [area, setArea] = useState('Clareira do Curandeiro')
  const areaRef = useRef(area)
  const [dialogue, setDialogue] = useState({ frog: true, speaker: 'Sapo Curandeiro', text: `${narrative?.frog || 'Há caminhos esperando por você.'} ${initialMission === 0 ? 'Comece pelas ervas: elas guardam um brilho dourado junto às trilhas e às ruínas.' : 'Comece pelos pirilampos: eles aparecem onde o Vale fica silencioso e a água reflete o céu.'}` })
  const dialogueRef = useRef(dialogue)

  useEffect(() => { stateRef.current = { stage, herbs, fireflies, herbsDone, firefliesDone, seal, bridgeOpen, echoes, tonic, threat, trust } }, [stage, herbs, fireflies, herbsDone, firefliesDone, seal, bridgeOpen, echoes, tonic, threat, trust])
  useEffect(() => { dialogueRef.current = dialogue }, [dialogue])
  useEffect(() => { areaRef.current = area }, [area])

  const counts = useMemo(() => [herbs.length, fireflies.length, bridgeOpen ? 1 : 0], [herbs, fireflies, bridgeOpen])
  const showDialogue = useCallback((speaker, text, frog = false) => setDialogue({ speaker, text, frog }), [])
  const attackRuin = useCallback(() => { if (!dialogueRef.current) castRuinLight(ruinDuel, playerRef.current) }, [ruinDuel])
  useEffect(() => {
    let mounted = true
    preloadFragmentSprite()
    preloadUndeadSprites()
    const image = new Image(); image.onload = () => { if (mounted) golemRef.current = image }; image.src = '/assets/vigia-pedra.png'
    return () => { mounted = false }
  }, [])
  const craftTonic = useCallback((nextStage) => {
    setTonic(true); setTrust((value) => Math.min(5, value + 1)); setStage(nextStage)
    setDialogue({ speaker: 'Sapo Curandeiro', frog: true, text: 'As ervas e as luzes se misturam num tônico azul-prateado. “Leve isto”, diz o Curandeiro. “A mutação escuta o que está vivo — e agora você pode ouvi-la de volta.”' })
  }, [])
  const answerRiddle = useCallback((option) => {
    if (option.correct) {
      setSeal(true)
      setDialogue({ speaker: 'Guardião da Ponte', guardian: true, text: 'A resposta abre o vazio. As três peças do selo tornam-se uma só em suas mãos. Leve-o ao mecanismo e atravesse.' })
    } else {
      setDialogue({ speaker: 'Guardião da Ponte', guardian: true, text: 'A pedra permanece fria. Pense naquilo que aumenta sempre que uma parte é retirada.' })
    }
  }, [])

  const interact = useCallback(() => {
    if (dialogueRef.current) { setDialogue(null); return }
    const player = playerRef.current
    const game = stateRef.current

    if (ruinDuel.active) { attackRuin(); return }
    if (distance(player, RUIN_ALTAR) < 60) {
      if (ruinDuel.won) { showDialogue('Pedras do Santuário', 'As runas estão serenas. O Vigia reconhece seus passos e não voltará a atacá-lo.'); return }
      if (!golemRef.current) { showDialogue('Pedras do Santuário', 'O Vigia ainda está se formando. Aguarde o carregamento do monstro e examine as pedras novamente.'); return }
      if (awakenRuin(ruinDuel, player)) {
        setRuinHud('active'); keysRef.current.clear()
        const intro = { speaker: 'O Vigia desperta', text: 'Ao mover uma pedra solta, você rompe o silêncio do santuário. As colunas estremecem e um gigante de rocha se ergue: “Quem toca a memória deve provar que sabe preservá-la”. Duelo iniciado! Mova-se com WASD, dispare luz com F ou Espaço e saia da marca dourada antes do impacto. E também dispara durante o duelo.' }
        dialogueRef.current = intro; setDialogue(intro)
      }
      return
    }

    const resident = villageInteraction(population, player)
    if (resident) { showDialogue(resident.speaker, resident.text); return }
    const villager = VILLAGE_OBJECTS.slice(3).find(item => distance(player, item) < 48)
    if (villager) { showDialogue(villager.speaker, villager.text); return }

    const echo = MEMORY_ECHOES.find((item) => !game.echoes.includes(item.id) && distance(player, item) < 52)
    if (echo) {
      setEchoes((current) => [...current, echo.id])
      setThreat((value) => Math.min(3, value + 1))
      setDialogue({ speaker: echo.title, text: `${echo.text} A sensação se desfaz, mas uma nova página aparece no seu caderno de memórias.` })
      return
    }

    if (distance(player, FROG) < 40) {
      if (game.stage === 0 && game.herbs.length === 3) {
        setHerbsDone(true)
        if (game.firefliesDone) {
          setDialogue({ speaker: 'Sapo Curandeiro', frog: true, text: 'Ervas e luz estão reunidas. Antes de encarar o Guardião, transforme-as em algo que possa proteger você.', options: [{ label: 'Preparar tônico do luar', craft: true, stage: 2 }], onChoose: (option) => craftTonic(option.stage) })
        } else {
          setDialogue({ speaker: 'Sapo Curandeiro', frog: true, text: 'As ervas estão seguras. Você pode guardá-las, ou preparar um tônico que desperta o eco da sua nova mente.', options: [{ label: 'Preparar tônico e seguir luzes', craft: true, stage: 1 }, { label: 'Guardar ingredientes por enquanto', mission: 1 }], onChoose: (option) => option.craft ? craftTonic(option.stage) : (setStage(1), setDialogue({ speaker: 'Sapo Curandeiro', frog: true, text: 'Leve este frasco. As luzes se aproximarão quando você andar devagar.' })) })
        }
      } else if (game.stage === 1 && game.fireflies.length === 3) {
        setFirefliesDone(true)
        if (game.herbsDone) {
          setDialogue({ speaker: 'Sapo Curandeiro', frog: true, text: 'O frasco está completo. Misture a luz às ervas e deixe que a cabana prepare você para a ponte.', options: [{ label: 'Preparar tônico do luar', craft: true, stage: 2 }], onChoose: (option) => craftTonic(option.stage) })
        } else {
          setDialogue({ speaker: 'Sapo Curandeiro', frog: true, text: 'O frasco está completo. Falta preparar o tónico para a travessia. Quer procurar as ervas agora?', options: [{ label: 'Buscar as ervas', mission: 0 }], onChoose: () => { setStage(0); setDialogue({ speaker: 'Sapo Curandeiro', frog: true, text: 'Procure o brilho amarelado junto às trilhas, pedras e ruínas.' }) } })
        }
      } else {
        const remaining = game.stage === 0 ? 3 - game.herbs.length : game.stage === 1 ? 3 - game.fireflies.length : 0
        showDialogue('Sapo Curandeiro', game.stage === 2 ? 'A ponte já escuta seus passos. O outro lado guarda a resposta que você procura.' : `Ainda faltam ${remaining}. Procure onde a luz âmbar toca o chão.`, true)
      }
      return
    }

    if (game.stage === 0) {
      const herb = HERBS.find((item) => !game.herbs.includes(item.id) && distance(player, item) < 42)
      if (herb) {
        const next = [...game.herbs, herb.id]; setHerbs(next)
        if (next.length === 3) setThreat((value) => Math.min(3, value + 1))
        showDialogue('Pensamento', next.length === 3 ? `A última erva. ${narrative?.path === 'vale' ? 'O Vale parece respirar aliviado.' : 'Ao longe, uma luz vermelha responde à sua coleta.'}` : `${herb.name}. ${herb.memory}`)
        return
      }
    }

    if (game.stage === 1) {
      const firefly = FIREFLIES.find((item) => !game.fireflies.includes(item.id) && distance(player, item) < 46)
      if (firefly) {
        const next = [...game.fireflies, firefly.id]; setFireflies(next)
        if (next.length === 3) setThreat((value) => Math.min(3, value + 1))
        showDialogue('Pensamento', next.length === 3 ? `O frasco brilha como uma pequena lua. ${narrative?.path === 'home' ? 'Por um instante, a luz parece um farol no meio da chuva.' : 'A névoa vermelha responde do outro lado do Vale.'}` : firefly.memory)
        return
      }
    }

    if (game.stage === 2 && distance(player, GUARDIAN) < 52) {
      if (game.seal) showDialogue('Guardião da Ponte', 'O selo já conhece sua mão. Encoste-o ao mecanismo dourado e a passagem responderá.', false)
      else setDialogue({
        speaker: 'Guardião da Ponte', guardian: true,
        text: 'Três partes guardam a passagem. Responda: o que cresce quanto mais se tira dele?',
        options: [{ label: 'Um buraco', correct: true }, { label: 'Uma sombra' }, { label: 'Uma memória' }],
        onChoose: answerRiddle,
      })
      return
    }
    if (game.stage === 2 && distance(player, BRIDGE_LEVER) < 48 && !game.bridgeOpen) {
      if (!game.seal) { showDialogue('Pensamento', 'Há um encaixe triangular no mecanismo. O Guardião ainda protege as peças do selo.'); return }
      setBridgeOpen(true); setThreat(3)
      showDialogue('O Vale', 'O selo se encaixa. As luzes atravessam o mecanismo e os dois lados da ponte se unem sobre o rio.')
      return
    }
    showDialogue('Pensamento', 'Só ouço folhas, água e o eco dos meus próprios passos.')
  }, [answerRiddle, craftTonic, narrative, showDialogue, ruinDuel, attackRuin, population])

  useEffect(() => {
    preloadPlayerRunSprites()
    loadImages({ ...Object.fromEntries(Object.entries(PLAYER_SPRITES).map(([k, v]) => [`player-${k}`, v])), frog: FROG_SPRITES.down }, (images) => { imagesRef.current = images })
    const onDown = (event) => {
      if (pause.current) return
      if (event.target instanceof HTMLElement && event.target.closest('button, input, textarea, select')) return
      const key = event.key.toLowerCase()
      if (key === 'q' && !event.repeat) { event.preventDefault(); startBoost(playerAnimation.boost, playerRef.current, Boolean(dialogueRef.current)) }
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', ' ', 'f'].includes(key)) event.preventDefault()
      if ((key === 'e' || key === ' ') && !event.repeat) interact()
      if (key === 'f' && !event.repeat) attackRuin()
      keysRef.current.add(key)
    }
    const onUp = (event) => keysRef.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown', onDown); window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [interact, attackRuin, playerAnimation.boost, pause])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let frameId
    const render = (time) => {
      const tick = clock.step(time, pause.current)
      if (!tick) { keysRef.current.clear(); frameId = requestAnimationFrame(render); return }
      const delta = tick.delta; time = tick.time
      const keys = keysRef.current
      const before = { x: playerRef.current.x, y: playerRef.current.y }
      if (!dialogueRef.current) {
        let dx = 0; let dy = 0
        if (keys.has('a') || keys.has('arrowleft')) dx -= 1
        if (keys.has('d') || keys.has('arrowright')) dx += 1
        if (keys.has('w') || keys.has('arrowup')) dy -= 1
        if (keys.has('s') || keys.has('arrowdown')) dy += 1
        if ((dx || dy) && !playerAnimation.boost.remaining) {
          const length = Math.hypot(dx, dy); dx /= length; dy /= length
          const player = playerRef.current
          player.direction = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down')
          const candidateX = { ...player, x: player.x + dx * MOVE_SPEED * delta }
          const candidateY = { ...player, y: player.y + dy * MOVE_SPEED * delta }
          if (validPosition(candidateX, stateRef.current.bridgeOpen) && (!ruinDuel.active || inRuinArena(candidateX))) player.x = candidateX.x
          if (validPosition(candidateY, stateRef.current.bridgeOpen) && (!ruinDuel.active || inRuinArena(candidateY))) player.y = candidateY.y
          player.x = clamp(player.x, 22, WORLD.width - 22); player.y = clamp(player.y, 28, WORLD.height - 24)
        }
      }

      const player = playerRef.current; const game = stateRef.current
      updateBoost(playerAnimation.boost, player, delta, point => validPosition(point, game.bridgeOpen) && (!ruinDuel.active || inRuinArena(point)), Boolean(dialogueRef.current))
      updatePlayerAnimation(playerAnimation, before, player, delta, Boolean(dialogueRef.current))
      if (!dialogueRef.current && ruinDuel.active) {
        if (keys.has('f') || keys.has(' ')) castRuinLight(ruinDuel, player)
        updateRuinDuel(ruinDuel, player, delta, point => validPosition(point, game.bridgeOpen))
        if (ruinDuel.event) {
          if (ruinDuel.event === 'tremor') {
            ruinDuel.event=null; keys.clear()
            const result={speaker:'Pensamento',text:'Os dois caíram… então por que o chão continua tremendo? Isso não vem das pedras. Tem alguma coisa se mexendo debaixo de mim…'}
            dialogueRef.current=result; setDialogue(result)
          } else {
          const won = ruinDuel.event === 'won'; ruinDuel.event = null; setRuinHud(won ? 'won' : 'dormant'); keys.clear()
          if (won) setTrust(value => Math.min(5, value + 1))
          const result = { speaker: won ? 'Pensamento' : 'Uma nova tentativa', text: won ? 'Um gigante que virou dois, pedras voando… e duas hordas saindo do chão. Que loucura foi tudo isso? Minhas patas ainda tremem. Pelo menos agora o chão está quieto. Preciso contar ao Curandeiro — se ele acreditar em mim.' : 'O santuário amortece sua queda e devolve você à entrada. Suas ervas, memórias e missões continuam intactas. Examine novamente as pedras para tentar outro duelo; afaste-se da marca antes que o golpe caia.' }
          dialogueRef.current = result; setDialogue(result)
          }
        }
      }
      if (!dialogueRef.current) updateLakeFrogs(lakeFrogs, delta, player, point => validPosition(point, game.bridgeOpen))
      if (!dialogueRef.current) updateVillagePopulation(population, delta, player, point => validPosition(point, game.bridgeOpen))
      const camera = cameraRef.current
      const targetX = clamp(player.x - VIEW.width / 2, 0, WORLD.width - VIEW.width)
      const targetY = clamp(player.x < 620 && player.y < 680 ? 85 : player.y - VIEW.height / 2, 0, WORLD.height - VIEW.height)
      const cameraEase = 1 - Math.pow(.0005, delta)
      camera.x += (targetX - camera.x) * cameraEase
      camera.y += (targetY - camera.y) * cameraEase

      ctx.clearRect(0, 0, VIEW.width, VIEW.height)
      const shake = ruinShake(ruinDuel, time)
      ctx.save(); ctx.translate(shake.x, shake.y)
      ctx.save(); ctx.translate(-camera.x, -camera.y)
      drawMap(ctx, time, game.bridgeOpen)
      drawUndeadHoles(ctx, ruinDuel)
      drawFarmActivity(ctx, population, time)
      population.animals.forEach(animal => drawVillageAnimal(ctx, animal))
      population.people.filter(p => p.y <= player.y).sort((a,b) => a.y-b.y).forEach(p => drawVillagePerson(ctx,p))
      lakeFrogs.forEach(frog => drawLakeFrog(ctx, frog))
      if (game.stage === 0) HERBS.filter((item) => !game.herbs.includes(item.id)).forEach((item) => drawHerb(ctx, item, time))
      if (game.stage === 1) FIREFLIES.filter((item) => !game.fireflies.includes(item.id)).forEach((item) => drawFirefly(ctx, item, time))
      ctx.restore()

      const playerScreen = { x: player.x - camera.x, y: player.y - camera.y }
      const frogScreen = { x: FROG.x - camera.x, y: FROG.y - camera.y }
      drawLighting(ctx, playerScreen, frogScreen, time)
      if (imagesRef.current) {
        const frog = imagesRef.current.frog
        ctx.drawImage(frog, frogScreen.x - 30, frogScreen.y - 45, 60, 54)
        const bob = 0
        ctx.save(); ctx.shadowColor = 'rgba(255, 195, 82, .35)'; ctx.shadowBlur = 12
        drawAnimatedPlayer(ctx, imagesRef.current, playerAnimation, playerScreen.x - 25, playerScreen.y - 53 + bob, 50, 63, 'player-'); ctx.restore()
      }
      ctx.save(); ctx.translate(-camera.x,-camera.y)
      population.people.filter(p => p.y > player.y).sort((a,b) => a.y-b.y).forEach(p => drawVillagePerson(ctx,p))
      ctx.restore()
      drawValleyAtmosphere(ctx, time, narrative, game.threat)
      ctx.save(); ctx.translate(-camera.x, -camera.y); drawRuinDuel(ctx, ruinDuel, player, golemRef.current, time); ctx.restore()
      ctx.restore()
      if (minimapRef.current) drawMinimap(minimapRef.current.getContext('2d'), player, game)
      const nextArea = AREA_ZONES.find((zone) => zone.test(player.x, player.y))?.name || 'Trilha das Folhas Âmbar'
      if (nextArea !== areaRef.current) { areaRef.current = nextArea; setArea(nextArea) }

      const nearFrog = distance(player, FROG) < 40
      const nearHerb = game.stage === 0 && HERBS.some((item) => !game.herbs.includes(item.id) && distance(player, item) < 42)
      const nearFly = game.stage === 1 && FIREFLIES.some((item) => !game.fireflies.includes(item.id) && distance(player, item) < 46)
      const nearLever = game.stage === 2 && !game.bridgeOpen && distance(player, BRIDGE_LEVER) < 48
      const nearGuardian = game.stage === 2 && distance(player, GUARDIAN) < 52
      const nearEcho = MEMORY_ECHOES.some((item) => !game.echoes.includes(item.id) && distance(player, item) < 52)
      const nearVillage = [...VILLAGE_OBJECTS.slice(3), ...population.people, GARDEN].some(item => distance(player, item) < 48)
      const nearRuins = distance(player, RUIN_ALTAR) < 60
      if (!dialogueRef.current && (nearFrog || nearHerb || nearFly || nearLever || nearGuardian || nearEcho || nearVillage || nearRuins || ruinDuel.active)) canvas.dataset.prompt = 'true'; else delete canvas.dataset.prompt
      if (game.bridgeOpen && player.x > EXIT.x && Math.abs(player.y - EXIT.y) < 70) onFinish()
      frameId = requestAnimationFrame(render)
    }
    frameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frameId)
  }, [narrative, onFinish, lakeFrogs, ruinDuel, population, playerAnimation, pause, clock])

  const setTouch = useCallback((direction) => {
    ;['w', 'a', 's', 'd'].forEach((key) => keysRef.current.delete(key))
    if (direction) keysRef.current.add({ up: 'w', down: 's', left: 'a', right: 'd' }[direction])
  }, [])

  return (
    <main className="game-screen">
      <header className="game-header"><Brand /><div><span>Entardecer</span><i /> <strong>Dia 1</strong></div></header>
      <div className="game-stage">
        <section className="canvas-shell" aria-label="Mapa jogável do Vale">
          <GameHud>
          <canvas ref={canvasRef} width={VIEW.width} height={VIEW.height} />
          <QuestCard hudGroup="tasks" stage={stage} counts={counts} />
          {ruinHud !== 'dormant' && <MissionPanel className="ruin-duel-panel" label="Vigia de Pedra"><span>{ruinHud === 'won' ? 'Santuário pacificado' : 'Duelo do santuário'}</span><p>{ruinHud === 'won' ? 'O Vigia reconhece você.' : 'F / Espaço: luz • WASD: esquivar'}</p>{ruinHud === 'active' && <button type="button" onClick={attackRuin} disabled={Boolean(dialogue)}>Disparar luz</button>}</MissionPanel>}
          {!dialogue && <div className="interaction-hint"><kbd>E</kbd><span>interagir</span></div>}
          <div className="area-label"><span>Você está em</span><strong>{area}</strong></div>
          <MissionPanel className="minimap" label="Mapa do Vale"><header><span>Mapa do Vale</span><strong>Visão geral</strong></header><canvas ref={minimapRef} width="210" height="132" /><footer><span>R Você</span><span>S Sapo</span><span>⌂ Casa</span><span>◆ Objetivo</span></footer></MissionPanel>
          <MissionPanel className="inventory" label="Mochila"><span>Mochila</span><div>{[0, 1, 2, 3].map((slot) => <i key={slot}>{slot === 0 && herbs.length ? '❧' : slot === 1 && fireflies.length ? '✦' : slot === 2 && tonic ? '⚗' : slot === 3 && seal ? '◇' : ''}</i>)}</div><p>❧ {herbs.length} <b>✦ {fireflies.length}</b></p></MissionPanel>
          <MissionPanel className="memory-log" label="Caderno de memórias"><span>Caderno de memórias</span><strong>Fragmentos recuperados <b>{echoes.length}/{MEMORY_ECHOES.length}</b></strong><p>{echoes.length ? 'As páginas azuis guardam pistas sobre o laboratório, o Curandeiro e o portão.' : 'Explore os pontos de interesse do Vale e pressione E quando a indicação de interação aparecer.'}</p></MissionPanel>
          <MissionPanel className={`threat-meter level-${threat}`} label="Interferência"><span>Interferência</span><div><i style={{ width: `${(threat / 3) * 100}%` }} /></div><small>{threat ? 'Algo do outro lado percebeu você.' : 'O Vale ainda está em silêncio.'}</small></MissionPanel>
          <MissionPanel className="bond-meter" label="Laço com o Curandeiro"><span>Laço com o Curandeiro</span><div>{[1, 2, 3, 4, 5].map((value) => <i className={value <= trust ? 'filled' : ''} key={value}>✦</i>)}</div><small>{trust >= 3 ? 'Ele confia no seu instinto.' : 'A confiança ainda está crescendo.'}</small></MissionPanel>
          {narrative && <MissionPanel className={`story-compass ${narrative.path}`} label="Intenção da jornada"><span>Intenção da jornada</span><strong><i>{narrative.icon}</i>{narrative.title}</strong><p>{narrative.objective}</p></MissionPanel>}
          </GameHud>
        </section>
      </div>
      <Dialogue dialogue={dialogue} onClose={() => setDialogue(null)} />
      <TouchControls setTouch={setTouch} interact={interact} />
    </main>
  )
}


function Epilogue({ onRestart, narrative }) {
  const ending = narrative?.path === 'vale'
    ? { title: <>O Vale<br /><em>permanece.</em></>, text: 'Ao atravessar o portão, você escolhe voltar uma última vez. A cabana do Curandeiro acende uma janela para você; o Vale não o chama mais de visitante, mas de guardião.' }
    : narrative?.path === 'truth'
      ? { title: <>A verdade<br /><em>atravessa.</em></>, text: 'Ao atravessar o portão, você desperta sob a chuva de Central Park com um fragmento azul na pata. O arquivo 07-B não era o começo da história — era a primeira pista.' }
      : { title: <>Um novo<br /><em>começo.</em></>, text: 'Ao atravessar o portão, o Vale se dissolve numa luz dourada. O ratinho desperta sob a chuva real do Central Park, exatamente sob a moita onde havia desmaiado.' }
  return (
    <main className="epilogue-screen">
      <div className="epilogue-rain" />
      <section>
        <p className="kicker">Epílogo • Central Park</p>
        <img src={PLAYER_SPRITES.down} alt="O ratinho desperto" />
        <h1>{ending.title}</h1>
        <p>{ending.text}</p>
        <p className="epilogue-note">Talvez o Vale tenha sido um refúgio secreto entre animais. Talvez tenha sido apenas a primeira paisagem criada por sua nova mente. A cidade continua fria, mas ele se ergue sobre duas patas, segura um ramo como cajado e contempla os humanos com plena consciência.</p>
        <blockquote>“Alguns lugares só existem<br />para quem aprendeu a enxergá-los.”</blockquote>
        <PrimaryButton onClick={onRestart}>Recomeçar a jornada</PrimaryButton>
      </section>
    </main>
  )
}

function AdminPanel({ screen, narrative, onNavigate, onPath }) {
  const [open, setOpen] = useState(false)
  const destinations = [
    ['home', 'Início'], ['prologue', 'Prólogo'], ['cabin', 'Cabana'], ['game', 'Vale'], ['village', 'Vila das Lanternas'], ['farm', 'Vila • Fazenda'], ['ruins', 'Ruínas • Vigia'], ['beyond', 'Ato II'], ['beyond-metro', 'Metrô • combate'], ['beyond-predator', 'Metrô • Predador'], ['beyond-district', 'Distrito 07-B'], ['epilogue', 'Epílogo'],
  ]
  return <aside className={`admin-panel${open ? ' open' : ''}`} aria-label="Controles administrativos">
    <button className="admin-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>ADM</button>
    {open && <div className="admin-menu"><header><span>Modo admin</span><small>Ir para qualquer parte</small></header><p>Capítulos</p><div className="admin-destinations">{destinations.map(([target, label]) => <button className={screen === target ? 'current' : ''} key={target} onClick={() => { onNavigate(target); setOpen(false) }}>{label}</button>)}</div><p>Intenção narrativa</p><div className="admin-paths">{Object.entries(STORY_PATHS).map(([path, value]) => <button className={narrative?.path === path ? 'active' : ''} key={path} onClick={() => onPath(path)}><i>{value.icon}</i>{value.label}</button>)}</div><small className="admin-note">Os saltos não exigem missões, memórias ou o duelo.</small></div>}
  </aside>
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [initialMission, setInitialMission] = useState(0)
  const [actCheckpoint, setActCheckpoint] = useState('street')
  const [narrative, setNarrative] = useState(null)
  const [blackout, setBlackout] = useState(null)
  const changeScreen = useCallback((nextScreen) => {
    setBlackout('closed')
    window.setTimeout(() => {
      setScreen(nextScreen)
      setBlackout('opening')
      window.setTimeout(() => setBlackout(null), 460)
    }, 460)
  }, [])
  const chooseMission = (mission) => { setInitialMission(mission); changeScreen('game') }
  const restart = () => { setNarrative(null); setInitialMission(0); setActCheckpoint('street'); setScreen('home') }
  const finishActTwo = (ending) => { setNarrative((current) => ({ ...current, path: ending, ...STORY_PATHS[ending] })); changeScreen('epilogue') }
  const adminNavigate = (target) => {
    if (!narrative && !['home', 'prologue'].includes(target)) setNarrative({ path: 'truth', ...STORY_PATHS.truth })
    if (target.startsWith('beyond')) { setActCheckpoint(target.split('-')[1] || 'street'); setScreen('beyond'); return }
    setScreen(target)
  }
  const adminSetPath = (path) => setNarrative({ path, ...STORY_PATHS[path] })
  const content = screen === 'home'
    ? <Home onStart={() => { setNarrative(null); setScreen('prologue') }} />
    : screen === 'prologue'
      ? <Prologue onContinue={() => changeScreen('cabin')} />
      : screen === 'cabin'
        ? <CabinPrelude narrative={narrative} onSetNarrative={setNarrative} onChooseMission={chooseMission} />
        : screen === 'game' || screen === 'village' || screen === 'ruins' || screen === 'farm'
          ? <Gameplay key={screen} villageStart={screen === 'village'} farmStart={screen === 'farm'} ruinsStart={screen === 'ruins'} initialMission={initialMission} narrative={narrative} onFinish={() => { setActCheckpoint('street'); changeScreen('beyond') }} />
          : screen === 'beyond'
            ? <ActTwo key={actCheckpoint} checkpoint={actCheckpoint} Brand={Brand} Dialogue={Dialogue} TouchControls={TouchControls} MissionPanel={MissionPanel} onFinish={finishActTwo} />
            : <Epilogue narrative={narrative} onRestart={restart} />
  return <GameMenu enabled={!['home', 'prologue', 'epilogue'].includes(screen) && !blackout} onHome={restart}>{content}<AdminPanel screen={screen} narrative={narrative} onNavigate={adminNavigate} onPath={adminSetPath} />{blackout && <div className={`blackout ${blackout}`} aria-hidden="true" />}</GameMenu>
}
