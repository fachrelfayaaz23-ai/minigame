const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const ui = {
  health: document.querySelector("#healthBar"),
  stamina: document.querySelector("#staminaBar"),
  boss: document.querySelector("#bossBar"),
  storyTitle: document.querySelector("#storyTitle"),
  storyText: document.querySelector("#storyText"),
  oath: document.querySelector("#oath"),
  cutscene: document.querySelector("#cutscene"),
  cutsceneKicker: document.querySelector("#cutsceneKicker"),
  cutsceneTitle: document.querySelector("#cutsceneTitle"),
  cutsceneSpeaker: document.querySelector("#cutsceneSpeaker"),
  cutsceneText: document.querySelector("#cutsceneText"),
  cutsceneNext: document.querySelector("#cutsceneNext"),
  mainMenu: document.querySelector("#mainMenu"),
  newGameBtn: document.querySelector("#newGameBtn"),
  skipIntroBtn: document.querySelector("#skipIntroBtn"),
  level: document.querySelector("#level"),
  points: document.querySelector("#points"),
  weapon: document.querySelector("#weapon"),
  flasks: document.querySelector("#flasks"),
  echoes: document.querySelector("#echoes"),
  phase: document.querySelector("#phase"),
  minions: document.querySelector("#minions"),
  status: document.querySelector("#status"),
  message: document.querySelector("#message"),
  bossName: document.querySelector("#bossName"),
};

const keys = new Set();
const mouse = { x: canvas.width / 2, y: canvas.height / 2, down: false };
let lastTime = 0;
let sparks = [];
let game;
let cutsceneStep = 0;
let typewriterTimer = 0;

const weapons = {
  longsword: { name: "Longsword", light: 22, heavy: 44, cost: 24, heavyCost: 46, reach: 64, heavyReach: 86, cooldown: 0.45, heavyCooldown: 0.85 },
  greatblade: { name: "Greatblade", light: 32, heavy: 68, cost: 32, heavyCost: 58, reach: 72, heavyReach: 102, cooldown: 0.62, heavyCooldown: 1.08 },
  daggers: { name: "Daggers", light: 15, heavy: 30, cost: 15, heavyCost: 32, reach: 52, heavyReach: 70, cooldown: 0.28, heavyCooldown: 0.58 },
};

const prologue = [
  {
    kicker: "Prologue",
    title: "The Bell Beneath Ash",
    text: "Forty winters ago, the chapel bell rang once beneath the earth. Every grave in the valley opened before the sound faded.",
  },
  {
    kicker: "The Oath",
    title: "Last Cinder-Knight",
    text: "The order burned itself away sealing the crypt. You are the last ember sent below, carrying a blade, three flasks, and a vow no one alive remembers.",
  },
  {
    kicker: "The Gatekeeper",
    title: "Grave Warden",
    text: "At the lowest nave waits the Warden, a knight chained to the bell by rusted prayer. It will test whether you are savior, thief, or another corpse.",
  },
  {
    kicker: "The Threshold",
    title: "A Voice In Iron",
    speaker: "Grave Warden",
    text: "Who trespasseth in my chapel of marrow? Speak, little ember, ere I grind thy oath into the dust.",
  },
  {
    kicker: "The Threshold",
    title: "A Blade Drawn",
    speaker: "Cinder-Knight",
    text: "I am the last flame of a murdered dawn. Unbar thy grave, Warden, or be made a door.",
  },
  {
    kicker: "The Threshold",
    title: "The Bell Stirs",
    speaker: "Grave Warden",
    text: "Then come, bright fool. Let thy courage ring against my steel, and learn how loudly hope can die.",
  },
  {
    kicker: "Begin",
    title: "Enter the Trial",
    text: "When the red warning blooms, dodge or parry. When the Warden staggers, answer with steel.",
  },
];

const story = {
  start: {
    title: "The Bell Beneath Ash",
    text: "You are the last cinder-knight sent below the ruined chapel. The bell has not rung for forty winters, and the dead now answer in its place.",
    oath: "Silence the bell",
  },
  bonfire: {
    title: "A Warmth That Remembers",
    text: "The bonfire carries names scratched into old iron. Resting here restores you, but the Grave Warden feels every ember you steal back from death.",
    oath: "End the Warden",
  },
  phaseTwo: {
    title: "The Warden Kindled",
    text: "Bone and armor split with furnace-light. The Warden snarls, \"Lo, the bell drinks blood again. Come then, oathling, and be its hymn.\"",
    oath: "Survive the truth",
  },
  parry: {
    title: "The Old Counter-Rite",
    text: "Steel kisses steel. The Warden reels: \"A fair answer, little flame. Now prove it was no accident.\"",
    oath: "Strike the opening",
  },
  death: {
    title: "Ash Takes Shape",
    text: "Your body falls. The Warden lowers its blade and whispers, \"Sleep, brief candle. I have buried brighter suns.\"",
    oath: "Rise again",
  },
  victory: {
    title: "The Bell Is Still",
    text: "The Warden kneels. \"Then toll me no more,\" it says, and the buried bell cracks once, then goes silent.",
    oath: "Trial complete",
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function resetGame(showMenu = false, skipIntro = false) {
  game = {
    mode: showMenu ? "menu" : "world",
    over: false,
    won: false,
    paused: false,
    inCutscene: false,
    lockOn: false,
    echoes: 0,
    spawnTimer: 2.4,
    bossGate: { x: 820, y: 270, r: 46 },
    bonfire: { x: 128, y: 435, r: 28, used: false },
    minions: [],
    level: 1,
    points: 0,
    nextLevelCost: 40,
    stats: { vigor: 0, endurance: 0, strength: 0, dexterity: 0 },
    weapon: "longsword",
    player: {
      x: 140,
      y: 390,
      r: 16,
      hp: 100,
      maxHp: 100,
      stamina: 100,
      maxStamina: 100,
      flasks: 3,
      invuln: 0,
      dodge: 0,
      attack: 0,
      heavy: 0,
      parry: 0,
      attackCooldown: 0,
      aim: 0,
    },
    boss: {
      x: 700,
      y: 270,
      r: 34,
      hp: 300,
      maxHp: 300,
      phase: 1,
      attackWindup: 1.2,
      slamCooldown: 2.1,
      stagger: 0,
      hurt: 0,
    },
  };
  sparks = [];
  ui.bossName.textContent = "Grave Warden";
  setStory("start");
  applyBuildStats();
  ui.mainMenu.classList.toggle("hidden", !showMenu);
  ui.cutscene.classList.add("hidden");
  if (!showMenu && !skipIntro) {
    startCutscene();
  } else if (!showMenu) {
    showMessage("Ashen Vale", "Explore, level at any time, then press F at the grave gate.");
  } else {
    showMessage("Ashen Trial", "Choose a pilgrimage to begin.");
  }
}

function startCutscene() {
  cutsceneStep = 0;
  game.inCutscene = true;
  ui.cutscene.classList.remove("hidden");
  renderCutscene();
}

function renderCutscene() {
  const scene = prologue[cutsceneStep];
  ui.cutsceneKicker.textContent = scene.kicker;
  ui.cutsceneTitle.textContent = scene.title;
  ui.cutsceneSpeaker.textContent = scene.speaker || "";
  ui.cutsceneText.dataset.fullText = scene.text;
  ui.cutsceneText.textContent = "";
  ui.cutsceneNext.textContent = cutsceneStep === prologue.length - 1 ? "Enter Vale" : "Continue";
  ui.cutsceneNext.disabled = true;
  clearInterval(typewriterTimer);
  let index = 0;
  typewriterTimer = setInterval(() => {
    index += 2;
    ui.cutsceneText.textContent = scene.text.slice(0, index);
    if (index >= scene.text.length) {
      clearInterval(typewriterTimer);
      ui.cutsceneNext.disabled = false;
    }
  }, 22);
}

function advanceCutscene() {
  if (!game.inCutscene) return;
  const fullText = ui.cutsceneText.dataset.fullText || "";
  if (ui.cutsceneText.textContent.length < fullText.length) {
    clearInterval(typewriterTimer);
    ui.cutsceneText.textContent = fullText;
    ui.cutsceneNext.disabled = false;
    return;
  }
  const frame = ui.cutscene.querySelector(".cutscene-frame");
  frame.classList.add("switching");
  cutsceneStep += 1;
  setTimeout(() => {
    frame.classList.remove("switching");
    if (cutsceneStep >= prologue.length) {
      game.inCutscene = false;
      ui.cutscene.classList.add("hidden");
      showMessage("Ashen Vale", "Explore, level at any time, then press F at the grave gate.");
      return;
    }
    renderCutscene();
  }, 180);
}

function setStory(key) {
  ui.storyTitle.textContent = story[key].title;
  ui.storyText.textContent = story[key].text;
  ui.oath.textContent = story[key].oath;
}

function applyBuildStats() {
  const p = game.player;
  const stats = game.stats;
  const hpRatio = p.maxHp ? p.hp / p.maxHp : 1;
  const staminaRatio = p.maxStamina ? p.stamina / p.maxStamina : 1;
  p.maxHp = 100 + stats.vigor * 18;
  p.maxStamina = 100 + stats.endurance * 14;
  p.hp = clamp(Math.round(p.maxHp * hpRatio), 1, p.maxHp);
  p.stamina = clamp(Math.round(p.maxStamina * staminaRatio), 0, p.maxStamina);
}

function levelUp(stat) {
  if (game.mode === "menu" || !(stat in game.stats) || game.echoes < game.nextLevelCost) {
    if (stat in game.stats) showMessage("Need Echoes", `${game.nextLevelCost} echoes required to level.`);
    return;
  }
  game.echoes -= game.nextLevelCost;
  game.level += 1;
  game.points += 1;
  game.stats[stat] += 1;
  game.nextLevelCost = Math.round(game.nextLevelCost * 1.35 + 18);
  applyBuildStats();
  showMessage("Level Up", `${stat[0].toUpperCase() + stat.slice(1)} increased.`);
}

function setWeapon(key) {
  if (!weapons[key]) return;
  game.weapon = key;
  document.querySelectorAll("[data-weapon]").forEach((button) => {
    button.classList.toggle("active", button.dataset.weapon === key);
  });
  showMessage("Weapon Changed", weapons[key].name);
}

function showMessage(title, text) {
  ui.message.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
  ui.message.classList.remove("hidden");
}

function hideMessage() {
  ui.message.classList.add("hidden");
}

function spawnSparks(x, y, color, count = 12) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 180;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35 + Math.random() * 0.35,
      maxLife: 0.7,
      color,
    });
  }
}

function resizePointer(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
}

function hitEnemy(enemy, damage, hitX, hitY) {
  enemy.hp = clamp(enemy.hp - damage, 0, enemy.maxHp);
  enemy.hurt = 0.18;
  spawnSparks(hitX, hitY, enemy.kind === "minion" ? "#9fbad7" : "#d7b36a", 16);
  return enemy.hp <= 0;
}

function attack(isHeavy = false) {
  const p = game.player;
  const weapon = weapons[game.weapon];
  const cost = isHeavy ? weapon.heavyCost : weapon.cost;
  if (game.over || game.paused || game.inCutscene || p.attackCooldown > 0 || p.stamina < cost) return;
  p.stamina -= cost;
  p.attack = isHeavy ? 0.28 : 0.18;
  p.heavy = isHeavy ? 0.28 : 0;
  p.attackCooldown = isHeavy ? weapon.heavyCooldown : weapon.cooldown;
  hideMessage();

  const reach = isHeavy ? weapon.heavyReach : weapon.reach;
  const hitX = p.x + Math.cos(p.aim) * reach;
  const hitY = p.y + Math.sin(p.aim) * reach;
  const arcHit = { x: hitX, y: hitY };
  const buildBonus = game.stats.strength * (isHeavy ? 5 : 3) + game.stats.dexterity * (game.weapon === "daggers" ? 4 : 2);
  const damage = (isHeavy ? weapon.heavy : weapon.light) + buildBonus;

  for (const minion of game.minions) {
    if (distance(arcHit, minion) < minion.r + (isHeavy ? 44 : 32)) {
      if (hitEnemy(minion, isHeavy ? 55 : 28, hitX, hitY)) {
        game.echoes += 18;
      }
    }
  }
  game.minions = game.minions.filter((minion) => minion.hp > 0);

  if (game.mode === "boss" && distance(arcHit, game.boss) < game.boss.r + (isHeavy ? 48 : 34)) {
    const finalDamage = isHeavy && game.boss.stagger > 0 ? damage * 2.4 : damage;
    if (isHeavy) game.boss.stagger = 0;
    if (hitEnemy(game.boss, finalDamage, hitX, hitY)) {
      game.over = true;
      game.won = true;
      game.echoes += 120;
      setStory("victory");
      showMessage("Prey Felled", "Press R to face the trial again.");
    } else {
      game.echoes += isHeavy ? 13 : 8;
    }
    if (!game.over && game.boss.hp <= game.boss.maxHp * 0.45 && game.boss.phase === 1) {
      game.boss.phase = 2;
      game.bossName.textContent = "Grave Warden, Kindled";
      setStory("phaseTwo");
      showMessage("Phase II", "The Warden is faster. Dodge through the red arc.");
    }
  }
}

function parry() {
  const p = game.player;
  if (game.over || game.paused || game.inCutscene || p.attackCooldown > 0 || p.stamina < 18) return;
  p.stamina -= 18;
  p.parry = 0.24;
  p.attackCooldown = 0.38;
  hideMessage();

  const bossAngle = Math.atan2(game.boss.y - p.y, game.boss.x - p.x);
  const bossFacing = Math.abs(Math.atan2(Math.sin(bossAngle - p.aim), Math.cos(bossAngle - p.aim)));
  if (game.mode === "boss" && distance(p, game.boss) < 132 && bossFacing < 1.05 && game.boss.attackWindup < 0.42) {
    game.boss.stagger = 1.45;
    game.boss.attackWindup = game.boss.phase === 1 ? 1.35 : 1.05;
    game.echoes += 20;
    setStory("parry");
    spawnSparks(game.boss.x, game.boss.y, "#f1d084", 34);
    showMessage("Parry", "Boss staggered. Heavy attack for critical damage.");
    return;
  }

  for (const minion of game.minions) {
    const angle = Math.atan2(minion.y - p.y, minion.x - p.x);
    const facing = Math.abs(Math.atan2(Math.sin(angle - p.aim), Math.cos(angle - p.aim)));
    if (distance(p, minion) < 62 && facing < 1.2 && minion.attackCooldown < 0.28) {
      minion.hp = 0;
      game.echoes += 24;
      spawnSparks(minion.x, minion.y, "#f1d084", 22);
      showMessage("Riposte", "Perfect parry.");
    }
  }
  game.minions = game.minions.filter((minion) => minion.hp > 0);
}

function drinkFlask() {
  const p = game.player;
  if (game.over || game.paused || game.inCutscene || p.flasks <= 0 || p.hp >= p.maxHp) return;
  p.flasks -= 1;
  p.hp = clamp(p.hp + 45, 0, p.maxHp);
  spawnSparks(p.x, p.y, "#77c184", 14);
}

function dodge(dt) {
  const p = game.player;
  if (game.over || game.paused || game.inCutscene || p.dodge > 0 || p.stamina < 34) return;
  const dx = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
  const dy = (keys.has("s") ? 1 : 0) - (keys.has("w") ? 1 : 0);
  const angle = dx || dy ? Math.atan2(dy, dx) : p.aim;
  p.stamina -= 34;
  p.dodge = 0.28;
  p.invuln = 0.34;
  p.x += Math.cos(angle) * 150 * dt;
  p.y += Math.sin(angle) * 150 * dt;
  hideMessage();
}

function damagePlayer(amount, knockbackAngle) {
  const p = game.player;
  if (p.invuln > 0 || game.over) return;
  p.hp = clamp(p.hp - amount, 0, p.maxHp);
  p.invuln = 0.55;
  p.x += Math.cos(knockbackAngle) * 24;
  p.y += Math.sin(knockbackAngle) * 24;
  spawnSparks(p.x, p.y, "#bf3f37", 18);
  if (p.hp <= 0) {
    game.over = true;
    setStory("death");
    showMessage("You Died", "Press R to retry.");
  }
}

function restBonfire() {
  const p = game.player;
  if (game.over || game.paused || game.inCutscene || distance(p, game.bonfire) > 58) return;
  p.hp = p.maxHp;
  p.stamina = p.maxStamina;
  p.flasks = 3;
  game.minions = [];
  game.spawnTimer = 4;
  game.bonfire.used = true;
  setStory("bonfire");
  spawnSparks(game.bonfire.x, game.bonfire.y, "#d7b36a", 30);
  showMessage("Bonfire Lit", "Vigor and flasks restored. The Warden remembers.");
}

function enterBossGate() {
  if (game.mode !== "world" || distance(game.player, game.bossGate) > 70) return false;
  game.mode = "boss";
  game.lockOn = false;
  game.minions = [];
  game.spawnTimer = 3.5;
  game.player.x = 230;
  game.player.y = 280;
  game.boss.x = 700;
  game.boss.y = 270;
  setStory("start");
  showMessage("Grave Gate", "The Warden accepts thy challenge.");
  return true;
}

function interact() {
  if (enterBossGate()) return;
  restBonfire();
}

function spawnMinion() {
  const limit = game.mode === "world" ? 4 : game.boss.phase === 1 ? 3 : 5;
  if (game.minions.length >= limit) return;
  const edge = Math.floor(Math.random() * 4);
  const positions = [
    { x: 60, y: 100 + Math.random() * 360 },
    { x: 900, y: 100 + Math.random() * 360 },
    { x: 120 + Math.random() * 720, y: 82 },
    { x: 120 + Math.random() * 720, y: 492 },
  ];
  const pos = positions[edge];
  game.minions.push({
    ...pos,
    kind: "minion",
    r: 13,
    hp: game.boss.phase === 1 ? 45 : 62,
    maxHp: game.boss.phase === 1 ? 45 : 62,
    attackCooldown: 0.75,
    hurt: 0,
  });
}

function updatePlayer(dt) {
  const p = game.player;
  if (game.lockOn && game.mode === "boss" && game.boss.hp > 0) {
    p.aim = Math.atan2(game.boss.y - p.y, game.boss.x - p.x);
  } else {
    p.aim = Math.atan2(mouse.y - p.y, mouse.x - p.x);
  }
  p.attack = Math.max(0, p.attack - dt);
  p.heavy = Math.max(0, p.heavy - dt);
  p.parry = Math.max(0, p.parry - dt);
  p.attackCooldown = Math.max(0, p.attackCooldown - dt);
  p.invuln = Math.max(0, p.invuln - dt);
  p.dodge = Math.max(0, p.dodge - dt);
  p.stamina = clamp(p.stamina + (p.dodge > 0 ? 8 : 28) * dt, 0, p.maxStamina);

  if (game.over) return;

  const dx = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
  const dy = (keys.has("s") ? 1 : 0) - (keys.has("w") ? 1 : 0);
  const len = Math.hypot(dx, dy) || 1;
  const speed = p.dodge > 0 ? 360 + game.stats.dexterity * 8 : 155 + game.stats.dexterity * 5;
  p.x += (dx / len) * speed * dt;
  p.y += (dy / len) * speed * dt;
  p.x = clamp(p.x, 50, canvas.width - 50);
  p.y = clamp(p.y, 70, canvas.height - 46);
}

function updateBoss(dt) {
  const b = game.boss;
  const p = game.player;
  if (game.over || game.mode !== "boss") return;

  b.hurt = Math.max(0, b.hurt - dt);
  b.stagger = Math.max(0, b.stagger - dt);
  if (b.stagger > 0) return;
  const angle = Math.atan2(p.y - b.y, p.x - b.x);
  const gap = distance(b, p);
  const pace = b.phase === 1 ? 72 : 100;
  if (gap > 118) {
    b.x += Math.cos(angle) * pace * dt;
    b.y += Math.sin(angle) * pace * dt;
  }

  b.attackWindup -= dt;
  if (b.attackWindup <= 0) {
    const range = b.phase === 1 ? 112 : 138;
    if (gap < range) {
      const damage = b.phase === 1 ? 22 : 30;
      damagePlayer(damage, angle);
      spawnSparks(b.x + Math.cos(angle) * 54, b.y + Math.sin(angle) * 54, "#b93632", 24);
      b.attackWindup = b.phase === 1 ? 1.2 : 0.82;
    } else {
      b.attackWindup = 0.28;
    }
  }

  b.slamCooldown -= dt;
  if (b.slamCooldown <= 0) {
    if (gap < 190) {
      damagePlayer(b.phase === 1 ? 16 : 24, angle);
      spawnSparks(p.x, p.y, "#7b8fad", 28);
    }
    b.slamCooldown = b.phase === 1 ? 3.3 : 2.15;
  }
}

function updateMinions(dt) {
  if (game.over) return;
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    spawnMinion();
    game.spawnTimer = game.mode === "world" ? 5 : game.boss.phase === 1 ? 6 : 4;
  }

  const p = game.player;
  for (const minion of game.minions) {
    minion.hurt = Math.max(0, minion.hurt - dt);
    minion.attackCooldown = Math.max(0, minion.attackCooldown - dt);
    const angle = Math.atan2(p.y - minion.y, p.x - minion.x);
    const gap = distance(minion, p);
    if (gap > 34) {
      minion.x += Math.cos(angle) * (game.boss.phase === 1 ? 92 : 116) * dt;
      minion.y += Math.sin(angle) * (game.boss.phase === 1 ? 92 : 116) * dt;
    }
    if (gap < 34 && minion.attackCooldown <= 0) {
      damagePlayer(game.boss.phase === 1 ? 8 : 12, angle);
      minion.attackCooldown = 0.9;
    }
  }
}

function updateSparks(dt) {
  sparks = sparks.filter((spark) => {
    spark.life -= dt;
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vx *= 0.94;
    spark.vy *= 0.94;
    return spark.life > 0;
  });
}

function drawArena() {
  const gradient = ctx.createRadialGradient(480, 270, 60, 480, 270, 520);
  gradient.addColorStop(0, "#2b2a23");
  gradient.addColorStop(1, "#0d0e0c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(241, 234, 217, 0.08)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i += 1) {
    ctx.beginPath();
    ctx.ellipse(480, 290, 110 + i * 46, 48 + i * 23, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(201, 157, 77, 0.22)";
  for (let i = 0; i < 15; i += 1) {
    const x = 80 + ((i * 173) % 790);
    const y = 88 + ((i * 97) % 380);
    ctx.fillRect(x, y, 36, 5);
  }

  const fire = game.bonfire;
  ctx.fillStyle = "rgba(215, 179, 106, 0.16)";
  ctx.beginPath();
  ctx.arc(fire.x, fire.y, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = game.bonfire.used ? "#f1d084" : "#8b6a3e";
  ctx.fillRect(fire.x - 5, fire.y - 28, 10, 46);
  ctx.fillStyle = "#cf3c34";
  ctx.beginPath();
  ctx.moveTo(fire.x, fire.y - 40);
  ctx.lineTo(fire.x + 13, fire.y - 13);
  ctx.lineTo(fire.x - 12, fire.y - 13);
  ctx.closePath();
  ctx.fill();

  if (game.mode === "world") {
    ctx.fillStyle = "rgba(109, 140, 174, 0.1)";
    ctx.fillRect(48, 76, 260, 120);
    ctx.fillRect(360, 392, 250, 88);
    ctx.fillStyle = "rgba(241, 234, 217, 0.12)";
    ctx.fillRect(350, 116, 70, 24);
    ctx.fillRect(444, 112, 54, 28);
    ctx.fillRect(526, 118, 82, 22);

    const gate = game.bossGate;
    ctx.fillStyle = "rgba(207, 60, 52, 0.12)";
    ctx.beginPath();
    ctx.arc(gate.x, gate.y, gate.r + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(201, 157, 77, 0.65)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(gate.x, gate.y, gate.r, Math.PI, Math.PI * 2);
    ctx.lineTo(gate.x + gate.r, gate.y + 58);
    ctx.lineTo(gate.x - gate.r, gate.y + 58);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "#c99d4d";
    ctx.fillRect(gate.x - 6, gate.y - 34, 12, 92);
  }
}

function drawPlayer() {
  const p = game.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.aim);
  ctx.globalAlpha = p.invuln > 0 ? 0.58 : 1;

  ctx.fillStyle = p.dodge > 0 ? "#6d8cae" : "#e8e1cf";
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#20211d";
  ctx.fillRect(6, -5, 25, 10);

  if (p.parry > 0) {
    ctx.strokeStyle = "#9fbad7";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(14, 0, 34, -0.95, 0.95);
    ctx.stroke();
  }

  if (p.attack > 0) {
    const weapon = weapons[game.weapon];
    ctx.strokeStyle = p.heavy > 0 ? "#f3a35f" : "#f1d084";
    ctx.lineWidth = p.heavy > 0 ? 11 : 7;
    ctx.beginPath();
    ctx.arc(12, 0, p.heavy > 0 ? weapon.heavyReach - 10 : weapon.reach - 6, -0.65, 0.65);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBoss() {
  if (game.mode !== "boss") return;
  const b = game.boss;
  const p = game.player;
  const angle = Math.atan2(p.y - b.y, p.x - b.x);
  const swingReady = b.attackWindup < 0.42;
  const slamReady = b.slamCooldown < 0.55;

  if (swingReady) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(angle);
    ctx.fillStyle = `rgba(207, 60, 52, ${0.14 + (0.42 - b.attackWindup) * 0.45})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(10, 0, b.phase === 1 ? 92 : 112, -0.78, 0.78);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  if (slamReady) {
    ctx.save();
    ctx.strokeStyle = `rgba(123, 143, 173, ${0.25 + (0.55 - b.slamCooldown) * 0.8})`;
    ctx.lineWidth = 4 + (0.55 - b.slamCooldown) * 10;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(b.x, b.y, 190 - b.slamCooldown * 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(angle);
  ctx.fillStyle = b.stagger > 0 ? "#9fbad7" : swingReady || slamReady ? "#cf3c34" : b.hurt > 0 ? "#d7b36a" : b.phase === 1 ? "#5b5549" : "#8f3935";
  ctx.beginPath();
  ctx.arc(0, 0, b.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#171713";
  ctx.fillRect(12, -8, 42, 16);

  const windup = b.attackWindup < 0.42;
  ctx.strokeStyle = windup ? "#cf3c34" : "rgba(241, 234, 217, 0.35)";
  ctx.lineWidth = windup ? 8 : 4;
  ctx.beginPath();
  ctx.arc(10, 0, b.phase === 1 ? 76 : 92, -0.72, 0.72);
  ctx.stroke();
  ctx.restore();
}

function drawMinions() {
  for (const minion of game.minions) {
    const angle = Math.atan2(game.player.y - minion.y, game.player.x - minion.x);
    const warning = minion.attackCooldown < 0.28 && distance(minion, game.player) < 48;
    if (warning) {
      ctx.save();
      ctx.translate(minion.x, minion.y);
      ctx.rotate(angle);
      ctx.fillStyle = `rgba(207, 60, 52, ${0.22 + (0.28 - minion.attackCooldown) * 1.4})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(4, 0, 42, -0.75, 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(minion.x, minion.y);
    ctx.rotate(angle);
    ctx.fillStyle = warning ? "#cf3c34" : minion.hurt > 0 ? "#d7b36a" : "#41576d";
    ctx.beginPath();
    ctx.arc(0, 0, minion.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#121515";
    ctx.fillRect(8, -3, 18, 6);
    ctx.restore();
  }
}

function drawSparks() {
  for (const spark of sparks) {
    ctx.globalAlpha = clamp(spark.life / spark.maxLife, 0, 1);
    ctx.fillStyle = spark.color;
    ctx.fillRect(spark.x - 2, spark.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
}

function updateUi() {
  const p = game.player;
  const b = game.boss;
  ui.health.style.width = `${(p.hp / p.maxHp) * 100}%`;
  ui.stamina.style.width = `${(p.stamina / p.maxStamina) * 100}%`;
  ui.boss.style.width = `${(b.hp / b.maxHp) * 100}%`;
  ui.level.textContent = game.level;
  ui.points.textContent = game.points;
  ui.weapon.textContent = weapons[game.weapon].name;
  ui.flasks.textContent = p.flasks;
  ui.echoes.textContent = game.echoes;
  ui.phase.textContent = game.mode === "world" ? "Vale" : b.phase === 1 ? "I" : "II";
  ui.minions.textContent = game.minions.length;
  document.querySelectorAll("[data-stat]").forEach((button) => {
    const stat = button.dataset.stat;
    button.textContent = `${stat[0].toUpperCase() + stat.slice(1)} ${game.stats[stat]}`;
  });
  document.querySelectorAll("[data-weapon]").forEach((button) => {
    button.classList.toggle("active", button.dataset.weapon === game.weapon);
  });
  ui.status.textContent = game.paused
    ? "Paused"
    : game.mode === "menu"
      ? "Menu"
      : game.lockOn
        ? "Locked"
        : game.mode === "world" && distance(p, game.bossGate) < 70
          ? "Gate"
          : distance(p, game.bonfire) < 58
            ? "Bonfire"
            : game.mode === "world"
              ? "Explore"
              : "Battle";
}

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000 || 0, 0.033);
  lastTime = time;

  if (!game.paused) {
    if (!game.inCutscene && game.mode !== "menu") {
      updatePlayer(dt);
      updateBoss(dt);
      updateMinions(dt);
    }
    updateSparks(dt);
  }

  drawArena();
  drawSparks();
  drawBoss();
  drawMinions();
  drawPlayer();
  updateUi();

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if ((key === " " || key === "enter") && game.inCutscene) {
    event.preventDefault();
    advanceCutscene();
    return;
  }
  keys.add(key);
  if (key === " ") {
    event.preventDefault();
    dodge(1 / 60);
  }
  if (key === "q") drinkFlask();
  if (key === "c") parry();
  if (key === "e") attack(true);
  if (key === "f") interact();
  if (key === "l") {
    if (game.mode !== "boss") return;
    game.lockOn = !game.lockOn;
    showMessage(game.lockOn ? "Lock On" : "Free Aim", game.lockOn ? "Attacks face the boss." : "Mouse aim restored.");
  }
  if (key === "p") {
    game.paused = !game.paused;
    showMessage(game.paused ? "Paused" : "Unpaused", game.paused ? "Press P to continue." : "The trial continues.");
  }
  if (key === "r") resetGame(false, true);
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
canvas.addEventListener("mousemove", resizePointer);
canvas.addEventListener("mousedown", (event) => {
  resizePointer(event);
  if (event.button === 2) {
    parry();
    return;
  }
  attack(event.shiftKey);
});
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
canvas.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  if (!touch) return;
  resizePointer(touch);
  attack();
});
ui.cutsceneNext.addEventListener("click", advanceCutscene);
ui.newGameBtn.addEventListener("click", () => resetGame(false, false));
ui.skipIntroBtn.addEventListener("click", () => resetGame(false, true));
document.querySelectorAll("[data-stat]").forEach((button) => {
  button.addEventListener("click", () => levelUp(button.dataset.stat));
});
document.querySelectorAll("[data-weapon]").forEach((button) => {
  button.addEventListener("click", () => setWeapon(button.dataset.weapon));
});

resetGame(true);
requestAnimationFrame(loop);
