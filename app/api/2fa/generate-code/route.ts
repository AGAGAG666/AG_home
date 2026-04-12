import { NextRequest, NextResponse } from 'next/server'

// Base32 解码
function base32Decode(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const bits: number[] = []

  for (const char of base32.toUpperCase()) {
    const val = alphabet.indexOf(char)
    if (val === -1) continue
    bits.push(
      (val & 16) >> 4,
      (val & 8) >> 3,
      (val & 4) >> 2,
      (val & 2) >> 1,
      val & 1,
    )
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8))
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] =
      (bits[i * 8] << 7) |
      (bits[i * 8 + 1] << 6) |
      (bits[i * 8 + 2] << 5) |
      (bits[i * 8 + 3] << 4) |
      (bits[i * 8 + 4] << 3) |
      (bits[i * 8 + 5] << 2) |
      (bits[i * 8 + 6] << 1) |
      bits[i * 8 + 7]
  }

  return bytes
}

// HMAC-SHA256
async function hmacSha256(
  key: Uint8Array,
  message: Uint8Array,
): Promise<Uint8Array> {
  return crypto.subtle
    .sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        key as BufferSource,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      ),
      message as BufferSource,
    )
    .then((buffer) => new Uint8Array(buffer))
}

// 生成 TOTP
async function generateTOTP(secret: string): Promise<string> {
  const key = base32Decode(secret)
  const time = Math.floor(Date.now() / 1000 / 30)
  const timeBytes = new ArrayBuffer(8)
  const timeView = new DataView(timeBytes)
  timeView.setUint32(4, time, false)

  const hmac = await hmacSha256(key, new Uint8Array(timeBytes))
  const offset = hmac[hmac.length - 1] & 0xf
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3]
  const otp = binary % 1000000

  return otp.toString().padStart(6, '0')
}

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json()

    if (!secret) {
      return NextResponse.json({ error: 'Secret is required' }, { status: 400 })
    }

    // 生成当前的 TOTP
    const code = await generateTOTP(secret)

    return NextResponse.json({ code })
  } catch (error) {
    console.error('Error generating code:', error)
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 },
    )
  }
}
