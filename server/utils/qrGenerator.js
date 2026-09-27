import QRCode from 'qrcode';

/**
 * Generates a data URL for a given UPI string
 * @param {string} upiString 
 * @returns {Promise<string>}
 */
export async function generateQrDataUrl(upiString) {
  try {
    return await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return null;
  }
}

/**
 * Builds standard Indian UPI URI string
 * @param {object} params
 * @param {string} params.upiId
 * @param {string} params.merchantName
 * @param {number} params.amount
 * @param {string} params.note
 * @returns {string}
 */
export function buildUpiUri({ upiId, merchantName, amount, note }) {
  const encodedName = encodeURIComponent(merchantName || 'TYPE SPEED');
  const encodedNote = encodeURIComponent(note || 'TYPE SPEED Premium Subscription');
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;
}
