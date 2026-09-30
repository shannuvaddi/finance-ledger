// Bundled artwork. Illustrations are PNG renders of assets/illustrations/*.svg
// (regenerate with scripts/render-illustrations.sh); sizes are the SVG's intrinsic size.
export const logo = require('../assets/images/icon.png');

export const illustrations = {
  hero: { source: require('../assets/images/illustrations/hero.png'), aspectRatio: 360 / 260 },
  banner: { source: require('../assets/images/illustrations/banner.png'), aspectRatio: 200 / 150 },
  empty: { source: require('../assets/images/illustrations/empty.png'), aspectRatio: 200 / 160 },
  assistant: { source: require('../assets/images/illustrations/assistant.png'), aspectRatio: 240 / 170 },
  piggy: { source: require('../assets/images/illustrations/piggy.png'), aspectRatio: 170 / 140 },
  voice: { source: require('../assets/images/illustrations/voice.png'), aspectRatio: 280 / 56 },
};
