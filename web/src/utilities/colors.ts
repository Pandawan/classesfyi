import tinycolor from "tinycolor2";

/**
 * Picks an appropriate text color based on the given background color using the W3C recommendations.
 * See: https://stackoverflow.com/a/41491220
 */
export function pickTextColorBasedOnBgColor(
  bgColor: string | tinycolor.Instance,
  lightColor: string | tinycolor.Instance,
  darkColor: string | tinycolor.Instance
) {
  const backgroundColor =
    typeof bgColor === "string" ? tinycolor(bgColor) : bgColor;
  const { r, g, b } = backgroundColor.toRgb();
  const uicolors = [r / 255, g / 255, b / 255];
  const c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.179
    ? tinycolor(darkColor).toHexString()
    : tinycolor(lightColor).toHexString();
}
