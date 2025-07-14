import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateQRCodeBuffer = async (data: string): Promise<Buffer> => {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    return qrCodeBuffer;
  } catch (error) {
    console.error('QR Code buffer generation error:', error);
    throw new Error('Failed to generate QR code buffer');
  }
};
