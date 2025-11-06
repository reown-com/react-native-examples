import QRCode from "qrcode";

const CONNECTING_ERROR_MARGIN = 0.1;
const CIRCLE_SIZE_MODIFIER = 2.5;
const QRCODE_MATRIX_MARGIN = 7;
const LOGO_PADDING = 25;

export interface QRData {
  rects: {
    x: number;
    y: number;
    size: number;
    fillType: "dot" | "edge";
  }[];
  circles: {
    cx: number;
    cy: number;
    r: number;
  }[];
  lines: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    strokeWidth: number;
  }[];
}

function isAdjacentDots(cy: number, otherCy: number, cellSize: number) {
  if (cy === otherCy) {
    return false;
  }
  const diff = cy - otherCy < 0 ? otherCy - cy : cy - otherCy;

  return diff <= cellSize + CONNECTING_ERROR_MARGIN;
}

function getMatrix(
  value: string,
  errorCorrectionLevel: QRCode.QRCodeErrorCorrectionLevel,
): boolean[][] {
  const arr = Array.prototype.slice.call(
    QRCode.create(value, { errorCorrectionLevel }).modules.data,
    0,
  );
  const sqrt = Math.sqrt(arr.length);

  return arr.reduce(
    (rows, key, index) =>
      (index % sqrt === 0
        ? rows.push([key])
        : rows[rows.length - 1].push(key)) && rows,
    [],
  );
}

function processQRMatrix(
  matrix: boolean[][],
  size: number,
  logoSize: number,
  logoBorderRadius?: number,
): QRData {
  const matrixLength = matrix.length;
  const cellSize = size / matrixLength;
  const halfCellSize = cellSize / 2;
  const strokeWidth = cellSize / (CIRCLE_SIZE_MODIFIER / 2);
  const circleRadius = cellSize / CIRCLE_SIZE_MODIFIER;

  const rects: QRData["rects"] = [];
  const circles: QRData["circles"] = [];
  const lines: QRData["lines"] = [];

  // Generate corner rectangles - optimized with direct indexing
  const qrList = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];
  const baseOffset = (matrixLength - QRCODE_MATRIX_MARGIN) * cellSize;

  for (let qrIdx = 0; qrIdx < 3; qrIdx++) {
    const qr = qrList[qrIdx]!;
    const x1 = baseOffset * qr.x;
    const y1 = baseOffset * qr.y;

    for (let i = 0; i < 3; i++) {
      const dotSize = cellSize * (QRCODE_MATRIX_MARGIN - i * 2);
      rects.push({
        x: x1 + cellSize * i,
        y: y1 + cellSize * i,
        size: dotSize,
        fillType: i % 2 === 0 ? "dot" : "edge",
      });
    }
  }

  const circleCoords: [number, number][] = [];

  // Determine if using circular or rounded rectangle hole
  const isCircular = logoBorderRadius === undefined;
  const effectiveBorderRadius =
    logoBorderRadius ?? (logoSize + LOGO_PADDING) / 2;

  // Calculate circle coordinates - optimized with configurable hole shape
  for (let i = 0; i < matrixLength; i++) {
    const row = matrix[i]!;
    const rowLength = row.length;

    for (let j = 0; j < rowLength; j++) {
      if (!row[j]) continue;

      // Skip corners check
      if (
        (i < QRCODE_MATRIX_MARGIN && j < QRCODE_MATRIX_MARGIN) ||
        (i > matrixLength - (QRCODE_MATRIX_MARGIN + 1) &&
          j < QRCODE_MATRIX_MARGIN) ||
        (i < QRCODE_MATRIX_MARGIN &&
          j > matrixLength - (QRCODE_MATRIX_MARGIN + 1))
      ) {
        continue;
      }

      // Calculate pixel coordinates first
      const cx = i * cellSize + halfCellSize;
      const cy = j * cellSize + halfCellSize;

      // Skip hole calculation if logoSize is 0 (arenaClear)
      if (logoSize === 0) {
        circleCoords.push([cx, cy]);
        continue;
      }

      // Calculate distance from center in pixel space
      const centerX = size / 2;
      const centerY = size / 2;

      let isOutsideLogoArea = false;

      if (isCircular) {
        // Circular hole
        const dx = cx - centerX;
        const dy = cy - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        const pixelRadius = (logoSize + LOGO_PADDING) / 2;
        isOutsideLogoArea = distanceFromCenter >= pixelRadius;
      } else {
        // Rounded rectangle hole
        const halfLogoArea = (logoSize + LOGO_PADDING) / 2;
        const dx = Math.abs(cx - centerX);
        const dy = Math.abs(cy - centerY);

        // Check if point is outside the rounded rectangle
        if (dx > halfLogoArea || dy > halfLogoArea) {
          isOutsideLogoArea = true;
        } else if (
          dx > halfLogoArea - effectiveBorderRadius &&
          dy > halfLogoArea - effectiveBorderRadius
        ) {
          // Check corner radius
          const cornerDx = dx - (halfLogoArea - effectiveBorderRadius);
          const cornerDy = dy - (halfLogoArea - effectiveBorderRadius);
          const cornerDistance = Math.sqrt(
            cornerDx * cornerDx + cornerDy * cornerDy,
          );
          isOutsideLogoArea = cornerDistance >= effectiveBorderRadius;
        } else {
          isOutsideLogoArea = false;
        }
      }

      if (isOutsideLogoArea) {
        circleCoords.push([cx, cy]);
      }
    }
  }

  // Build circlesToConnect - optimized loop
  const circlesToConnect: Record<number, number[]> = {};
  for (let k = 0; k < circleCoords.length; k++) {
    const [cx, cy] = circleCoords[k]!;
    const existing = circlesToConnect[cx];
    if (existing) {
      existing.push(cy);
    } else {
      circlesToConnect[cx] = [cy];
    }
  }

  // Process circles and lines - optimized to avoid Object.entries
  for (const cxKey in circlesToConnect) {
    const cx = Number(cxKey);
    const cys = circlesToConnect[cxKey]!;

    if (cys.length === 1) {
      const firstCy = cys[0];
      if (firstCy === undefined) continue;

      // Single dot, add as circle
      circles.push({
        cx,
        cy: firstCy,
        r: circleRadius,
      });
      continue;
    }

    // Sort once for line grouping
    cys.sort((a, b) => a - b);

    // Track which dots are connected and which are lonely
    const isConnected = new Array(cys.length).fill(false);

    // Find all adjacent pairs
    for (let i = 0; i < cys.length - 1; i++) {
      const currentCy = cys[i];
      const nextCy = cys[i + 1];
      if (
        currentCy !== undefined &&
        nextCy !== undefined &&
        isAdjacentDots(currentCy, nextCy, cellSize)
      ) {
        isConnected[i] = true;
        isConnected[i + 1] = true;
      }
    }

    // Add lonely dots as circles and build line groups
    let groupStart = -1;
    let groupEnd = -1;

    for (let i = 0; i < cys.length; i++) {
      const cy = cys[i];
      if (cy === undefined) continue;

      if (!isConnected[i]) {
        // Lonely dot - add as circle
        circles.push({
          cx,
          cy,
          r: circleRadius,
        });

        // Finish any ongoing line group
        if (groupStart !== -1 && groupEnd !== -1 && groupStart !== groupEnd) {
          lines.push({
            x1: cx,
            x2: cx,
            y1: groupStart,
            y2: groupEnd,
            strokeWidth,
          });
        }
        groupStart = -1;
        groupEnd = -1;
      } else {
        // Part of a line group
        if (groupStart === -1) {
          groupStart = cy;
          groupEnd = cy;
        } else {
          // Check if adjacent to previous
          const prevCy = cys[i - 1];
          if (
            i > 0 &&
            prevCy !== undefined &&
            isAdjacentDots(cy, prevCy, cellSize)
          ) {
            groupEnd = cy;
          } else {
            // Gap in the group, finish previous line
            if (groupStart !== groupEnd) {
              lines.push({
                x1: cx,
                x2: cx,
                y1: groupStart,
                y2: groupEnd,
                strokeWidth,
              });
            }
            groupStart = cy;
            groupEnd = cy;
          }
        }
      }
    }

    // Don't forget the last group
    if (groupStart !== -1 && groupEnd !== -1 && groupStart !== groupEnd) {
      lines.push({
        x1: cx,
        x2: cx,
        y1: groupStart,
        y2: groupEnd,
        strokeWidth,
      });
    }
  }

  return { rects, circles, lines };
}

export function generateQRData(
  uri: string,
  size: number,
  logoSize: number,
  logoBorderRadius?: number,
): QRData {
  if (!uri || size <= 0) {
    throw new Error("Invalid QR code parameters");
  }

  const matrix = getMatrix(uri, "Q");

  return processQRMatrix(matrix, size, logoSize, logoBorderRadius);
}

export const QRCodeUtil = {
  generate: generateQRData,
};
