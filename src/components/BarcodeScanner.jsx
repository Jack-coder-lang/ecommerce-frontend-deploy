import { useState, useRef, useEffect } from 'react';
import { Camera, Scan, Package } from 'lucide-react';

export default function BarcodeScanner({ onScan }) {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      videoRef.current.srcObject = stream;
      setIsScanning(true);
    } catch (error) {
      alert('Accès caméra refusé');
    }
  };

  const captureAndScan = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 300, 300);
    
    // Simulation scan code barres
    const barcode = `PROD${Math.random().toString().slice(2, 8)}`;
    onScan(barcode);
    setIsScanning(false);
  };

  return (
    <div className="card-brand p-6">
      <div className="flex items-center gap-3 mb-4">
        <Scan className="w-6 h-6 text-brand-cyan" />
        <h3 className="text-xl font-bold">Scan Code Barres</h3>
      </div>

      {!isScanning ? (
        <button onClick={startScanner} className="w-full btn-primary">
          <Camera className="w-5 h-5 inline mr-2" />
          Démarrer le Scan
        </button>
      ) : (
        <div className="text-center">
          <div className="relative inline-block">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-64 h-64 rounded-lg border-2 border-brand-cyan"
            />
            <div className="absolute inset-0 border-2 border-red-500 animate-pulse rounded-lg"></div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" width="300" height="300" />
          
          <div className="mt-4 space-y-2">
            <button onClick={captureAndScan} className="btn-primary">
              <Scan className="w-5 h-5 inline mr-2" />
              Scanner le Code
            </button>
            <button 
              onClick={() => setIsScanning(false)}
              className="w-full btn-secondary"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}