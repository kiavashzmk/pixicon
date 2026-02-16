export function buildAnimationShorthand(animName, cell) {
  const count = cell.iterationCount || 'infinite';
  const dir = cell.direction || 'normal';
  const fill = cell.fillMode || 'none';
  return `${animName} ${cell.duration}s ${cell.easing} ${cell.delay}s ${count} ${dir} ${fill}`;
}

export function generateKeyframes(animationType, cell) {
  switch (animationType) {
    case 'pulse':
      return `@keyframes pulse-${cell.id} {
  0%, 100% { opacity: ${cell.opacity.from}; transform: translate(var(--tx), var(--ty)) scale(${cell.scale.from}); }
  50% { opacity: ${cell.opacity.to}; transform: translate(var(--tx), var(--ty)) scale(${cell.scale.to}); }
}`;

    case 'fade':
      return `@keyframes fade-${cell.id} {
  0%, 100% { opacity: ${cell.opacity.from}; }
  50% { opacity: ${cell.opacity.to}; }
}`;

    case 'bounce':
      return `@keyframes bounce-${cell.id} {
  0%, 100% { transform: translate(var(--tx), var(--ty)) scale(${cell.scale.from}); opacity: ${cell.opacity.from}; }
  50% { transform: translate(var(--tx), calc(var(--ty) - 8px)) scale(${cell.scale.to}); opacity: ${cell.opacity.to}; }
}`;

    case 'spin':
      return `@keyframes spin-${cell.id} {
  0% { transform: translate(var(--tx), var(--ty)) rotate(0deg) scale(${cell.scale.from}); opacity: ${cell.opacity.from}; }
  50% { opacity: ${cell.opacity.to}; }
  100% { transform: translate(var(--tx), var(--ty)) rotate(360deg) scale(${cell.scale.from}); opacity: ${cell.opacity.from}; }
}`;

    case 'shake':
      return `@keyframes shake-${cell.id} {
  0%, 100% { transform: translate(var(--tx), var(--ty)) translateX(0); opacity: ${cell.opacity.from}; }
  25% { transform: translate(var(--tx), var(--ty)) translateX(-4px); }
  50% { transform: translate(var(--tx), var(--ty)) translateX(4px); opacity: ${cell.opacity.to}; }
  75% { transform: translate(var(--tx), var(--ty)) translateX(-4px); }
}`;

    case 'wobble':
      return `@keyframes wobble-${cell.id} {
  0%, 100% { transform: translate(var(--tx), var(--ty)) rotate(0deg) scale(${cell.scale.from}); opacity: ${cell.opacity.from}; }
  25% { transform: translate(var(--tx), var(--ty)) rotate(-15deg) scale(${cell.scale.to}); }
  50% { opacity: ${cell.opacity.to}; }
  75% { transform: translate(var(--tx), var(--ty)) rotate(15deg) scale(${cell.scale.to}); }
}`;

    case 'flip':
      return `@keyframes flip-${cell.id} {
  0% { transform: translate(var(--tx), var(--ty)) scaleX(1); opacity: ${cell.opacity.from}; }
  50% { transform: translate(var(--tx), var(--ty)) scaleX(0); opacity: ${cell.opacity.to}; }
  100% { transform: translate(var(--tx), var(--ty)) scaleX(1); opacity: ${cell.opacity.from}; }
}`;

    case 'glow':
      return `@keyframes glow-${cell.id} {
  0%, 100% { filter: drop-shadow(0 0 0 currentColor) brightness(1); opacity: ${cell.opacity.from}; }
  50% { filter: drop-shadow(0 0 6px currentColor) brightness(1.3); opacity: ${cell.opacity.to}; }
}`;

    case 'slide-in':
      return `@keyframes slide-in-${cell.id} {
  0% { transform: translate(calc(var(--tx) - 30px), var(--ty)); opacity: 0; }
  100% { transform: translate(var(--tx), var(--ty)); opacity: ${cell.opacity.from}; }
}`;

    case 'typewriter':
      return `@keyframes typewriter-${cell.id} {
  0% { opacity: 0; }
  50% { opacity: 0; }
  50.1% { opacity: ${cell.opacity.from}; }
  100% { opacity: ${cell.opacity.from}; }
}`;

    default:
      return '';
  }
}

export function generateCSSKeyframes(animationType, cell) {
  switch (animationType) {
    case 'pulse':
      return `@keyframes pulse-${cell.id} {
  0%, 100% { opacity: ${cell.opacity.from}; transform: scale(${cell.scale.from}); }
  50% { opacity: ${cell.opacity.to}; transform: scale(${cell.scale.to}); }
}`;

    case 'fade':
      return `@keyframes fade-${cell.id} {
  0%, 100% { opacity: ${cell.opacity.from}; }
  50% { opacity: ${cell.opacity.to}; }
}`;

    case 'bounce':
      return `@keyframes bounce-${cell.id} {
  0%, 100% { transform: translateY(0) scale(${cell.scale.from}); opacity: ${cell.opacity.from}; }
  50% { transform: translateY(-8px) scale(${cell.scale.to}); opacity: ${cell.opacity.to}; }
}`;

    case 'spin':
      return `@keyframes spin-${cell.id} {
  0% { transform: rotate(0deg) scale(${cell.scale.from}); opacity: ${cell.opacity.from}; }
  50% { opacity: ${cell.opacity.to}; }
  100% { transform: rotate(360deg) scale(${cell.scale.from}); opacity: ${cell.opacity.from}; }
}`;

    case 'shake':
      return `@keyframes shake-${cell.id} {
  0%, 100% { transform: translateX(0); opacity: ${cell.opacity.from}; }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); opacity: ${cell.opacity.to}; }
  75% { transform: translateX(-4px); }
}`;

    case 'wobble':
      return `@keyframes wobble-${cell.id} {
  0%, 100% { transform: rotate(0deg) scale(${cell.scale.from}); opacity: ${cell.opacity.from}; }
  25% { transform: rotate(-15deg) scale(${cell.scale.to}); }
  50% { opacity: ${cell.opacity.to}; }
  75% { transform: rotate(15deg) scale(${cell.scale.to}); }
}`;

    case 'flip':
      return `@keyframes flip-${cell.id} {
  0% { transform: perspective(200px) rotateY(0deg); opacity: ${cell.opacity.from}; }
  50% { transform: perspective(200px) rotateY(180deg); opacity: ${cell.opacity.to}; }
  100% { transform: perspective(200px) rotateY(360deg); opacity: ${cell.opacity.from}; }
}`;

    case 'glow':
      return `@keyframes glow-${cell.id} {
  0%, 100% { filter: drop-shadow(0 0 0 currentColor) brightness(1); opacity: ${cell.opacity.from}; }
  50% { filter: drop-shadow(0 0 6px currentColor) brightness(1.3); opacity: ${cell.opacity.to}; }
}`;

    case 'slide-in':
      return `@keyframes slide-in-${cell.id} {
  0% { transform: translateX(-30px); opacity: 0; }
  100% { transform: translateX(0); opacity: ${cell.opacity.from}; }
}`;

    case 'typewriter':
      return `@keyframes typewriter-${cell.id} {
  0% { opacity: 0; }
  50% { opacity: 0; }
  50.1% { opacity: ${cell.opacity.from}; }
  100% { opacity: ${cell.opacity.from}; }
}`;

    default:
      return '';
  }
}

export function generateKeyframesDeduplicated(activeCells) {
  const seen = new Map();
  const keyframes = [];

  for (const cell of activeCells) {
    if (cell.animationType === 'none') continue;

    const hash = `${cell.animationType}-${cell.opacity.from}-${cell.opacity.to}-${cell.scale.from}-${cell.scale.to}`;

    if (!seen.has(hash)) {
      seen.set(hash, cell.id);
      keyframes.push(generateKeyframes(cell.animationType, cell));
    }
  }

  return { keyframes, hashMap: seen };
}
