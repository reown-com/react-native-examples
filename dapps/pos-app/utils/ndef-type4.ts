// NDEF Type 4 Tag handler using the demo app's NDEF library
// Based on the demo app implementation from @icedevml/react-native-host-card-emulation
// Using the NDEF library from the demo app's ndef-lib directory

// We'll need to copy the NDEF library files from the demo app
// For now, let's use the same approach but with proper encoding based on the demo app's implementation

export function createNDEFType4TagHandler(
  content: string,
  isText: boolean = true,
) {
  // Create Capability Container (E103)
  // Format: CC Length (2 bytes) + Mapping Version (1 byte) + MLe (2 bytes) + MLc (2 bytes) +
  //         T (1 byte) + L (1 byte) + NDEF File ID (2 bytes) + Max NDEF File Size (2 bytes) +
  //         Read Access (1 byte) + Write Access (1 byte)
  // Based on NFCAndroid implementation (underwindfall/NFCAndroid)
  // CC Length: 0x0011 (17 bytes) - not including the length field itself
  // Mapping Version: 0x20 (2.0)
  // MLe: 0xFFFF (65535), MLc: 0xFFFF (65535)
  // T: 0x04, L: 0x06
  // NDEF File ID: 0xE104
  // Max NDEF Size: 0xFFFE (65534)
  // Read Access: 0x00, Write Access: 0xFF
  // Full CC: "001120FFFF04FF06E104FFFE00FF"
  const fileE103Hex = "001120FFFF04FF06E104FFFE00FF";
  const fileE103 = hexToBytes(fileE103Hex);
  const fileE103Padded = padBuffer(fileE103, 32);
  console.log(
    "Capability Container (E103) created, length:",
    fileE103Padded.length,
  );
  console.log(
    "CC hex:",
    bytesToHex(Array.from(fileE103Padded)).substring(0, 64) + "...",
  );

  // Verify CC structure
  if (fileE103.length >= 15) {
    const ccLength = (fileE103[0] << 8) | fileE103[1];
    const mappingVersion = fileE103[2];
    const mle = (fileE103[3] << 8) | fileE103[4];
    const mlc = (fileE103[5] << 8) | fileE103[6];
    const t = fileE103[7];
    const l = fileE103[8];
    const ndefFileId = (fileE103[9] << 8) | fileE103[10];
    const maxNdefSize = (fileE103[11] << 8) | fileE103[12];
    const readAccess = fileE103[13];
    const writeAccess = fileE103[14];

    console.log(
      "CC Structure - Length:",
      ccLength,
      "Mapping Version:",
      mappingVersion.toString(16),
      "MLe:",
      mle,
      "MLc:",
      mlc,
      "T:",
      t.toString(16),
      "L:",
      l.toString(16),
      "NDEF File ID:",
      "0x" + ndefFileId.toString(16).toUpperCase(),
      "Max NDEF Size:",
      maxNdefSize,
      "Read Access:",
      readAccess,
      "Write Access:",
      writeAccess,
    );
  }

  // Create NDEF message using the same approach as the demo app
  // The demo app uses: NDEF.encodeMessage([NDEF.textRecord(...)]) or NDEF.encodeMessage([NDEF.uriRecord(...)])
  const ndefRecord = isText
    ? createTextRecord(content, "en")
    : createURIRecord(content);

  // Encode the NDEF message (single record)
  const ndefBytes = new Uint8Array(encodeNdefMessage([ndefRecord]));
  console.log("NDEF message encoded, length:", ndefBytes.length);
  console.log(
    "NDEF message hex:",
    bytesToHex(Array.from(ndefBytes)).substring(0, 100) + "...",
  );

  // Verify NDEF message structure
  if (ndefBytes.length > 0) {
    const flags = ndefBytes[0];
    const mb = (flags & 0x80) !== 0;
    const me = (flags & 0x40) !== 0;
    const sr = (flags & 0x10) !== 0;
    const tnf = flags & 0x07;
    console.log("NDEF flags - MB:", mb, "ME:", me, "SR:", sr, "TNF:", tnf);

    if (ndefBytes.length > 1) {
      const typeLength = ndefBytes[1];
      console.log("NDEF type length:", typeLength);

      if (ndefBytes.length > 2) {
        const payloadLength = sr
          ? ndefBytes[2]
          : (ndefBytes[2] << 24) |
            (ndefBytes[3] << 16) |
            (ndefBytes[4] << 8) |
            ndefBytes[5];
        console.log("NDEF payload length:", payloadLength);
      }
    }
  }

  // NDEF file format: 2-byte length field + NDEF message
  // Match demo app structure: create buffer with 2 bytes, then add NDEF message
  const fileE104 = new Uint8Array(2 + ndefBytes.length);

  // Write length (big-endian) - length of NDEF message only (excluding the 2-byte length field)
  fileE104[0] = (ndefBytes.length >> 8) & 0xff;
  fileE104[1] = ndefBytes.length & 0xff;

  // Copy NDEF message after the 2-byte length field
  fileE104.set(ndefBytes, 2);

  // Pad to 256 bytes (file size specified in Capability Container)
  const fileE104Padded = padBuffer(fileE104, 256);
  console.log("NDEF file (E104) created, length:", fileE104Padded.length);
  console.log(
    "NDEF file length field:",
    fileE104[0].toString(16).padStart(2, "0"),
    fileE104[1].toString(16).padStart(2, "0"),
  );

  const files: Record<number, Uint8Array> = {
    0xe103: fileE103Padded,
    0xe104: fileE104Padded,
  };

  let currentFile: Uint8Array | null = null;

  return (capduHex: string): string => {
    const capdu = hexToBytes(capduHex);
    console.log("Processing APDU:", capduHex, "Length:", capdu.length);

    const prefix = bytesToHex(Array.from(capdu.slice(0, 2))).toUpperCase();

    // Validate class
    if (capdu[0] !== 0x00) {
      console.log("Invalid class byte:", capdu[0]);
      return "6E00";
    }

    if (prefix === "00A4") {
      // SELECT command
      console.log(
        "SELECT command received, full APDU:",
        Array.from(capdu)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" "),
      );
      const capduPrefix = Array.from(capdu.slice(0, 4));

      if (arraysEqual(capduPrefix, [0x00, 0xa4, 0x04, 0x00])) {
        // SELECT AID
        // Format: 00 A4 04 00 [Lc] [AID]
        // Verify AID if present
        if (capdu.length >= 5) {
          const aidLength = capdu[4];
          if (capdu.length >= 5 + aidLength) {
            const aidBytes = capdu.slice(5, 5 + aidLength);
            const aidHex = bytesToHex(Array.from(aidBytes)).toUpperCase();
            console.log("SELECT AID - AID:", aidHex);

            // According to Stack Overflow, use D2760000850101 for NDEF tag emulation
            const expectedAids = ["D2760000850101"];
            if (!expectedAids.includes(aidHex)) {
              console.log(
                "SELECT AID - Unknown AID:",
                aidHex,
                "Expected: D2760000850101",
              );
              // Still accept it for now, but log a warning
            }
          }
        }
        console.log("SELECT AID - resetting currentFile");
        currentFile = null;
        // Return 9000 (success) - NFCAndroid implementation just returns 9000, no FCI
        return "9000";
      } else if (arraysEqual(capduPrefix, [0x00, 0xa4, 0x00, 0x0c])) {
        // SELECT FILE
        console.log("SELECT FILE command");
        if (capdu.length < 7 || capdu[4] !== 0x02) {
          console.log("Invalid SELECT FILE format, P2:", capdu[4]);
          return "6700";
        }

        const fileId = (capdu[5] << 8) | capdu[6];
        console.log(
          "SELECT FILE ID:",
          "0x" + fileId.toString(16).toUpperCase(),
        );

        if (!files.hasOwnProperty(fileId)) {
          console.log("File not found:", fileId);
          return "6A82";
        }

        currentFile = files[fileId];
        console.log("File selected, size:", currentFile.length);
        return "9000";
      } else {
        console.log(
          "Unknown SELECT variant:",
          Array.from(capduPrefix)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" "),
        );
        return "6A00";
      }
    } else if (prefix === "00B0") {
      // READ BINARY
      if (capdu.length < 5) {
        console.log("READ BINARY command too short");
        return "6700";
      }

      const offset = (capdu[2] << 8) | capdu[3];
      const le = capdu[4];
      console.log("READ BINARY - offset:", offset, "length:", le);

      if (currentFile === null) {
        console.log("No file selected for READ BINARY");
        return "6985";
      }

      const data = currentFile.slice(offset, offset + le);
      console.log("Reading", data.length, "bytes from file");

      const response = concatUint8Arrays([data, new Uint8Array([0x90, 0x00])]);
      const responseHex = bytesToHex(Array.from(response));
      console.log(
        "READ BINARY response:",
        responseHex.substring(0, 100) + (responseHex.length > 100 ? "..." : ""),
      );
      return responseHex;
    }

    console.log("Unknown command prefix:", prefix);
    return "6D00";
  };
}

// NDEF encoding functions based on the demo app's implementation
function createNdefRecord(
  tnf: number,
  type: number[],
  id: number[],
  payload: number[],
): any {
  return {
    tnf,
    type,
    id,
    payload,
  };
}

function createTextRecord(text: string, languageCode: string = "en"): any {
  // Encode text payload: [langCodeLength, ...langCode, ...text]
  const langBytes = stringToBytes(languageCode);
  const textBytes = stringToBytes(text);
  const payload = [langBytes.length, ...langBytes, ...textBytes];

  // RTD_TEXT = [0x54] = "T"
  return createNdefRecord(1, [0x54], [], payload); // TNF_WELL_KNOWN = 1
}

function createURIRecord(uri: string): any {
  // Encode URI payload: [protocolCode, ...uriBytes]
  // Protocol codes: 0x00 = no prefix, 0x01 = http://www., 0x02 = https://www., 0x03 = http://, 0x04 = https://
  let protocolCode = 0x00; // Default: no prefix
  let uriWithoutPrefix = uri;

  if (uri.startsWith("https://")) {
    protocolCode = 0x04; // https://
    uriWithoutPrefix = uri.substring(8); // Remove "https://"
  } else if (uri.startsWith("http://")) {
    protocolCode = 0x03; // http://
    uriWithoutPrefix = uri.substring(7); // Remove "http://"
  } else if (uri.startsWith("https://www.")) {
    protocolCode = 0x02; // https://www.
    uriWithoutPrefix = uri.substring(12); // Remove "https://www."
  } else if (uri.startsWith("http://www.")) {
    protocolCode = 0x01; // http://www.
    uriWithoutPrefix = uri.substring(11); // Remove "http://www."
  }

  const uriBytes = stringToBytes(uriWithoutPrefix);
  const payload = [protocolCode, ...uriBytes];

  // RTD_URI = [0x55] = "U"
  return createNdefRecord(1, [0x55], [], payload); // TNF_WELL_KNOWN = 1
}

function encodeNdefMessage(records: any[]): number[] {
  if (!records || records.length === 0) {
    return [];
  }

  const message: number[] = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const mb = i === 0; // messageBegin
    const me = i === records.length - 1; // messageEnd
    const cf = false; // chunkFlag (not implemented)
    const sr = record.payload.length < 0xff; // shortRecord (< 255, not 256!)
    const il = record.id.length > 0; // idLengthFieldIsPresent

    // Build flags byte - match demo app exactly
    let flags = record.tnf & 0x07; // TNF (3 bits)
    if (mb) flags |= 0x80; // MB (Message Begin)
    if (me) flags |= 0x40; // ME (Message End)
    if (cf) flags |= 0x20; // CF (Chunk Flag)
    if (sr) flags |= 0x10; // SR (Short Record)
    if (il) flags |= 0x08; // IL (ID Length present)

    message.push(flags);
    message.push(record.type.length); // Type Length

    // Payload length encoding - match demo app exactly
    if (sr) {
      // Short record: single byte
      message.push(record.payload.length);
    } else {
      // Long record: 4 bytes, big-endian (MSB first)
      const payloadLength = record.payload.length;
      message.push((payloadLength >> 24) & 0xff);
      message.push((payloadLength >> 16) & 0xff);
      message.push((payloadLength >> 8) & 0xff);
      message.push(payloadLength & 0xff);
    }

    // ID Length (if present)
    if (il) {
      message.push(record.id.length);
    }

    // Add type, ID, and payload
    message.push(...record.type);
    if (il) {
      message.push(...record.id);
    }
    message.push(...record.payload);
  }

  return message;
}

// Helper to convert string to bytes (UTF-8)
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
