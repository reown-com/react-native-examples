import { VariantName, Variants } from "@/constants/variants";
import {
  BlendMode,
  ImageFormat,
  Skia,
  type SkImage,
} from "@shopify/react-native-skia";
import { Asset } from "expo-asset";
import { useLogsStore } from "@/store/useLogsStore";

// Same source assets the on-screen header (components/header-image.tsx) uses.
const BASE_LOGO = require("@/assets/images/brand.png");
const PLUS_LOGO = require("@/assets/images/plus.png");

// Rendered much larger than the 18px on-screen header so the thermal printer
// (~203 dpi, 1-bit) gets crisp edges. Mirrors the header's relative sizing.
const LOGO_HEIGHT = 80;
const PLUS_HEIGHT = LOGO_HEIGHT * 0.6;
const GAP = 16;
const PADDING = 8;

async function loadSkiaImage(source: number): Promise<SkImage | null> {
  const asset = Asset.fromModule(source);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) return null;
  const data = await Skia.Data.fromURI(uri);
  return Skia.Image.MakeImageFromEncoded(data);
}

/**
 * Composites the header lockup — WalletConnect Pay + "+" + partner logo — into
 * a single black-on-white PNG and returns it as a base64 data-URI.
 *
 * The thermal printer only accepts base64 images and prints one image per call
 * (so the three header assets can't be laid out in a row by the printer itself).
 * We draw them onto an offscreen Skia surface, force every glyph solid black via
 * a SrcIn blend (the on-screen header tints to the theme color, which would be
 * invisible on white paper), and snapshot the result.
 *
 * Returns null if the assets/surface can't be produced — callers fall back to
 * the pre-built logo.
 */
export async function buildReceiptLogo(
  variant: VariantName,
): Promise<string | null> {
  try {
    const baseImage = await loadSkiaImage(BASE_LOGO);
    if (!baseImage) return null;

    const elements: { image: SkImage; height: number }[] = [
      { image: baseImage, height: LOGO_HEIGHT },
    ];

    const variantLogo = Variants[variant]?.variantLogo as number | undefined;
    if (variantLogo) {
      const plusImage = await loadSkiaImage(PLUS_LOGO);
      const partnerImage = await loadSkiaImage(variantLogo);
      if (plusImage && partnerImage) {
        elements.push({ image: plusImage, height: PLUS_HEIGHT });
        elements.push({ image: partnerImage, height: LOGO_HEIGHT });
      }
    }

    // Scale each asset to its target height, preserving aspect ratio.
    const sized = elements.map(({ image, height }) => ({
      image,
      w: height * (image.width() / image.height()),
      h: height,
    }));

    const contentWidth =
      sized.reduce((sum, s) => sum + s.w, 0) + GAP * (sized.length - 1);
    const contentHeight = Math.max(...sized.map((s) => s.h));

    const canvasWidth = Math.ceil(contentWidth + PADDING * 2);
    const canvasHeight = Math.ceil(contentHeight + PADDING * 2);

    const surface = Skia.Surface.MakeOffscreen(canvasWidth, canvasHeight);
    if (!surface) return null;

    const canvas = surface.getCanvas();
    // White background so transparent areas print as blank paper.
    canvas.clear(Skia.Color("white"));

    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    // SrcIn keeps each asset's alpha but swaps its color to solid black.
    paint.setColorFilter(
      Skia.ColorFilter.MakeBlend(Skia.Color("black"), BlendMode.SrcIn),
    );

    let x = PADDING;
    for (const s of sized) {
      const y = PADDING + (contentHeight - s.h) / 2; // vertically center
      const src = Skia.XYWHRect(0, 0, s.image.width(), s.image.height());
      const dest = Skia.XYWHRect(x, y, s.w, s.h);
      canvas.drawImageRect(s.image, src, dest, paint);
      x += s.w + GAP;
    }

    surface.flush();
    const base64 = surface
      .makeImageSnapshot()
      .encodeToBase64(ImageFormat.PNG, 100);
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    useLogsStore
      .getState()
      .addLog("error", message, "printer", "buildReceiptLogo");
    return null;
  }
}
