// Simplified NDEF Type 4 Tag handler
// Based on the demo app implementation from @icedevml/react-native-host-card-emulation

// Helper to convert string to bytes
function stringToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      bytes.push(charCode);
    } else if (charCode < 0x800) {
      bytes.push(0xc0 | (charCode >> 6));
      bytes.push(0x80 | (charCode & 0x3f));
    } else {
      bytes.push(0xe0 | (charCode >> 12));
      bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      bytes.push(0x80 | (charCode & 0x3f));
    }
  }
  return bytes;
}

// Simple NDEF text record encoder
function encodeTextRecord(text: string): number[] {
  const lang = "en";
  const langBytes = stringToBytes(lang);
  const textBytes = stringToBytes(text);
  
  // TNF_WELL_KNOWN = 1, RTD_TEXT = "T"
  const type = stringToBytes("T");
  
  // NDEF record structure:
  // Flags (1 byte): MB=1, ME=1, CF=0, SR=1, IL=0, TNF=1
  const flags = 0b11010001; // MB=1, ME=1, SR=1, TNF=1
  const typeLength = type.length;
  const payloadLength = 1 + langBytes.length + textBytes.length; // lang code length + lang + text
  const idLength = 0;
  
  // Payload: lang code length (1 byte) + lang + text
  const payload = [langBytes.length, ...langBytes, ...textBytes];
  
  // Build NDEF record
  const record = [
    flags,
    typeLength,
    payloadLength,
    ...type,
    ...payload,
  ];
  
  return record;
}

// Simple NDEF URI record encoder
function encodeURIRecord(uri: string): number[] {
  // TNF_WELL_KNOWN = 1, RTD_URI = "U"
  const type = stringToBytes("U");
  
  // URI prefix code: 0x00 = no prefix (full URI)
  const uriBytes = stringToBytes(uri);
  const payload = [0x00, ...uriBytes]; // 0x00 = no prefix
  
  // NDEF record structure:
  // Flags (1 byte): MB=1, ME=1, CF=0, SR=1, IL=0, TNF=1
  const flags = 0b11010001; // MB=1, ME=1, SR=1, TNF=1
  const typeLength = type.length;
  const payloadLength = payload.length;
  const idLength = 0;
  
  // Build NDEF record
  const record = [
    flags,
    typeLength,
    payloadLength,
    ...type,
    ...payload,
  ];
  
  return record;
}

export function createNDEFType4TagHandler(
  content: string,
  isText: boolean = true,
) {
  // Create Capability Container (E103)
  const fileE103Hex = "001720010000FF0406E10401000000";
  const fileE103 = hexToBytes(fileE103Hex);
  const fileE103Padded = padBuffer(fileE103, 32);

  // Create NDEF file (E104)
  const ndefMessage = isText
    ? encodeTextRecord(content)
    : encodeURIRecord(content);

  const ndefBytes = new Uint8Array(ndefMessage);

  // NDEF file format: 2-byte length field + NDEF message
  const fileE104 = new Uint8Array(2);
  
  // Write length (big-endian)
  fileE104[0] = (ndefBytes.length >> 8) & 0xff;
  fileE104[1] = ndefBytes.length & 0xff;

  const fileE104Full = concatUint8Arrays([fileE104, ndefBytes]);

  // Pad to 256 bytes (file size specified in Capability Container)
  const fileE104Padded = padBuffer(fileE104Full, 256);

  const files: Record<number, Uint8Array> = {
    0xe103: fileE103Padded,
    0xe104: fileE104Padded,
  };

  let currentFile: Uint8Array | null = null;

  return (capduHex: string): string => {
    const capdu = hexToBytes(capduHex);

    const prefix = bytesToHex(Array.from(capdu.slice(0, 2))).toUpperCase();

    // Validate class
    if (capdu[0] !== 0x00) {
      return "6E00";
    }

    if (prefix === "00A4") {
      // SELECT command
      const capduPrefix = Array.from(capdu.slice(0, 4));
      if (arraysEqual(capduPrefix, [0x00, 0xa4, 0x04, 0x00])) {
        // SELECT AID
        currentFile = null;
        return "9000";
      } else if (arraysEqual(capduPrefix, [0x00, 0xa4, 0x00, 0x0c])) {
        // SELECT FILE
        if (capdu[4] !== 0x02) {
          return "6700";
        }

        const fileId = (capdu[5] << 8) | capdu[6];

        if (!files.hasOwnProperty(fileId)) {
          return "6A82";
        }

        currentFile = files[fileId];
        return "9000";
      } else {
        return "6A00";
      }
    } else if (prefix === "00B0") {
      // READ BINARY
      const offset = (capdu[2] << 8) | capdu[3];
      const le = capdu[4];

      if (currentFile === null) {
        return "6985";
      }

      const data = currentFile.slice(offset, offset + le);

      const response = concatUint8Arrays([
        data,
        new Uint8Array([0x90, 0x00]),
      ]);

      return bytesToHex(Array.from(response));
    }

    return "6D00";
  };
}

// Helper functions
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: number[] | Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function padBuffer(buffer: Uint8Array, length: number): Uint8Array {
  if (buffer.length >= length) {
    return buffer;
  }

  const padded = new Uint8Array(length);
  padded.set(buffer, 0);
  return padded;
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function arraysEqual(a: Uint8Array | number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

