function channelLuminance(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const value = hex.replace("#", "");
  const channels =
    value.length === 3
      ? [...value].map((channel) => Number.parseInt(channel.repeat(2), 16))
      : [value.slice(0, 2), value.slice(2, 4), value.slice(4, 6)].map((channel) =>
          Number.parseInt(channel, 16),
        );
  const [red, green, blue] = channels.map(channelLuminance);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastText(background: string, dark: string, light: string) {
  return contrastRatio(dark, background) >= contrastRatio(light, background) ? dark : light;
}
