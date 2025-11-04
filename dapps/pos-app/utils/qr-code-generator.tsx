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
): QRData {
  const matrixLength = matrix.length;
  const cellSize = size / matrixLength;
  const halfCellSize = cellSize / 2;
  const strokeWidth = cellSize / (CIRCLE_SIZE_MODIFIER / 2);
  const circleRadius = cellSize / CIRCLE_SIZE_MODIFIER;

  // Pre-allocate arrays with estimated capacity
  const rects: QRData["rects"] = [];
  rects.length = 27; // 3 corners × 3 layers × 3 = 27 rects max
  let rectIndex = 0;

  // Estimate circle capacity (roughly half the matrix minus corners and logo area)
  const estimatedCircles = Math.floor((matrixLength * matrixLength) / 2);
  const circles: QRData["circles"] = [];
  circles.length = estimatedCircles;
  let circleIndex = 0;

  const lines: QRData["lines"] = [];
  lines.length = Math.floor(estimatedCircles / 4);
  let lineIndex = 0;

  // Generate corner rectangles - optimized with direct indexing
  const qrList = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];
  const baseOffset = (matrixLength - QRCODE_MATRIX_MARGIN) * cellSize;

  for (let qrIdx = 0; qrIdx < 3; qrIdx++) {
    const qr = qrList[qrIdx];
    const x1 = baseOffset * qr.x;
    const y1 = baseOffset * qr.y;

    for (let i = 0; i < 3; i++) {
      const dotSize = cellSize * (QRCODE_MATRIX_MARGIN - i * 2);
      rects[rectIndex++] = {
        x: x1 + cellSize * i,
        y: y1 + cellSize * i,
        size: dotSize,
        fillType: i % 2 === 0 ? "dot" : "edge",
      };
    }
  }

  const clearArenaSize = Math.floor((logoSize + LOGO_PADDING) / cellSize);
  const centerPoint = matrixLength / 2;
  const radius = clearArenaSize / 2;
  const circleCoords: [number, number][] = [];

  // Calculate circle coordinates - optimized with direct indexing and Math.pow avoidance
  for (let i = 0; i < matrixLength; i++) {
    const row = matrix[i];
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

      const dx = i - centerPoint;
      const dy = j - centerPoint;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

      if (distanceFromCenter >= radius) {
        const cx = i * cellSize + halfCellSize;
        const cy = j * cellSize + halfCellSize;
        circleCoords.push([cx, cy]);
      }
    }
  }

  // Build circlesToConnect - optimized loop
  const circlesToConnect: Record<number, number[]> = {};
  for (let k = 0; k < circleCoords.length; k++) {
    const [cx, cy] = circleCoords[k];
    if (circlesToConnect[cx]) {
      circlesToConnect[cx].push(cy);
    } else {
      circlesToConnect[cx] = [cy];
    }
  }

  // Process circles and lines - optimized to avoid Object.entries
  for (const cxKey in circlesToConnect) {
    const cx = Number(cxKey);
    const cys = circlesToConnect[cxKey];

    if (cys.length === 1) {
      // Single dot, add as circle
      circles[circleIndex++] = {
        cx,
        cy: cys[0],
        r: circleRadius,
      };
      continue;
    }

    // Sort once for line grouping
    cys.sort((a, b) => a - b);

    // Track which dots are connected and which are lonely
    const isConnected = new Array(cys.length).fill(false);

    // Find all adjacent pairs
    for (let i = 0; i < cys.length - 1; i++) {
      if (isAdjacentDots(cys[i], cys[i + 1], cellSize)) {
        isConnected[i] = true;
        isConnected[i + 1] = true;
      }
    }

    // Add lonely dots as circles and build line groups
    let groupStart = -1;
    let groupEnd = -1;

    for (let i = 0; i < cys.length; i++) {
      const cy = cys[i];

      if (!isConnected[i]) {
        // Lonely dot - add as circle
        circles[circleIndex++] = {
          cx,
          cy,
          r: circleRadius,
        };

        // Finish any ongoing line group
        if (groupStart !== -1 && groupEnd !== -1 && groupStart !== groupEnd) {
          lines[lineIndex++] = {
            x1: cx,
            x2: cx,
            y1: groupStart,
            y2: groupEnd,
            strokeWidth,
          };
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
          if (i > 0 && isAdjacentDots(cy, cys[i - 1], cellSize)) {
            groupEnd = cy;
          } else {
            // Gap in the group, finish previous line
            if (groupStart !== groupEnd) {
              lines[lineIndex++] = {
                x1: cx,
                x2: cx,
                y1: groupStart,
                y2: groupEnd,
                strokeWidth,
              };
            }
            groupStart = cy;
            groupEnd = cy;
          }
        }
      }
    }

    // Don't forget the last group
    if (groupStart !== -1 && groupEnd !== -1 && groupStart !== groupEnd) {
      lines[lineIndex++] = {
        x1: cx,
        x2: cx,
        y1: groupStart,
        y2: groupEnd,
        strokeWidth,
      };
    }
  }

  // Trim arrays to actual size
  rects.length = rectIndex;
  circles.length = circleIndex;
  lines.length = lineIndex;

  return { rects, circles, lines };
}

// Run asynchronously without blocking the UI
export async function generateQRDataAsync(
  uri: string,
  size: number,
  logoSize: number,
): Promise<QRData> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!uri || size <= 0) {
          throw new Error("Invalid QR code parameters");
        }

        const matrix = getMatrix(uri, "Q");
        const data = processQRMatrix(matrix, size, logoSize);
        resolve(data);
      } catch (error) {
        console.error("QR generation failed:", error);
        reject(error);
      }
    }, 0);
  });
}
