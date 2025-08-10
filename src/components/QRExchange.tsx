// File: src/components/QRExchange.tsx
import React, { useState, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

interface QRExchangeProps {
  value: string;
  onScan: (value: string) => void;
  title: string;
  subtitle?: string;
}

export const QRExchange: React.FC<QRExchangeProps> = ({
  value,
  onScan,
  title,
  subtitle
}) => {
  const [qrDataURL, setQRDataURL] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | undefined>(undefined);
  
  // Generate QR code
  React.useEffect(() => {
    if (value) {
      QRCode.toDataURL(value, {
        errorCorrectionLevel: 'L' as const,
        margin: 2,
        scale: 8,
        width: 256
      }).then(setQRDataURL).catch(console.error);
    }
  }, [value]);
  
  // Start camera scanning
  const startScanning = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Start scanning loop
        scanIntervalRef.current = window.setInterval(() => {
          scanQRCode();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('Camera access denied or not available');
    }
  }, []);
  
  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    setIsScanning(false);
  }, []);
  
  const scanQRCode = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    
    if (code) {
      onScan(code.data);
      stopScanning();
    }
  }, [onScan, stopScanning]);
  
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        
        if (code) {
          onScan(code.data);
        } else {
          alert('No QR code found in image');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
  }, [onScan]);
  
  const handlePaste = useCallback(() => {
    if (pasteValue.trim()) {
      onScan(pasteValue.trim());
      setPasteValue('');
    }
  }, [pasteValue, onScan]);
  
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    }
  }, [value]);
  
  React.useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);
  
  return (
    <div className="qr-exchange bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      {subtitle && <p className="text-gray-400 mb-4">{subtitle}</p>}
      
      {/* QR Code Display */}
      {value && qrDataURL && (
        <div className="mb-6 text-center">
          <img src={qrDataURL} alt="QR Code" className="mx-auto mb-4" />
          <button
            onClick={copyToClipboard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Copy Code
          </button>
        </div>
      )}
      
      {/* Scanning Interface */}
      <div className="space-y-4">
        {!isScanning ? (
          <div className="space-y-3">
            <button
              onClick={startScanning}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold"
            >
              📷 Scan QR Code
            </button>
            
            <div className="text-center text-gray-400">or</div>
            
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold cursor-pointer block text-center">
                📁 Upload Image
              </span>
            </label>
            
            <div className="text-center text-gray-400">or</div>
            
            <div className="space-y-2">
              <textarea
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                placeholder="Paste code here..."
                className="w-full bg-gray-700 text-white p-3 rounded-lg resize-none"
                rows={3}
              />
              <button
                onClick={handlePaste}
                disabled={!pasteValue.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold"
              >
                Use Pasted Code
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <button
              onClick={stopScanning}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold"
            >
              Stop Scanning
            </button>
          </div>
        )}
      </div>
    </div>
  );
};