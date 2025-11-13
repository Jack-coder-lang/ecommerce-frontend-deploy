import { useState, useRef, useEffect } from 'react';
import { Camera, Scan, Package, QrCode } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { barcodeAPI, cartAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function BarcodeScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scannedCode, setScannedCode] = useState('');
  const scannerRef = useRef(null);

  const startRealScanner = async () => {
    setIsScanning(true);
    setScannedProduct(null);
    setScannedCode('');
    
    try {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: []
      });

      scannerRef.current = scanner;

      const onScanSuccess = async (decodedText) => {
        try {
          await scanner.clear();
          setIsScanning(false);
          
          // Rechercher le produit scanné
          const response = await barcodeAPI.search(decodedText);
          setScannedProduct(response.data);
          setScannedCode(decodedText);
        } catch (error) {
          console.error('Produit non trouvé:', error);
          setScannedCode(decodedText);
          toast.error('Produit non trouvé');
        }
      };

      const onScanFailure = (error) => {
        // Gérer les erreurs silencieusement
      };

      scanner.render(onScanSuccess, onScanFailure);
    } catch (error) {
      console.error('Erreur initialisation scanner:', error);
      toast.error('Erreur du scanner');
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    setIsScanning(false);
    setScannedProduct(null);
    setScannedCode('');
  };

  const addToCart = async () => {
    try {
      await cartAPI.addItem({
        productId: scannedProduct.id,
        quantity: 1
      });
      toast.success('Produit ajouté au panier');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Scan Code Barres</h1>
        
        <div className="card-brand p-6 text-center">
          <div className="w-16 h-16 bg-brand-cyan-light rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-brand-cyan" />
          </div>

          {!isScanning && !scannedProduct && !scannedCode && (
            <>
              <h3 className="text-xl font-bold mb-2">Scanner un produit</h3>
              <p className="text-gray-600 mb-6">Scannez le code barres pour retrouver rapidement un produit</p>
              
              <button onClick={startRealScanner} className="w-full btn-primary mb-4">
                <Camera className="w-5 h-5 inline mr-2" />
                Démarrer le Scan
              </button>
            </>
          )}

          {isScanning && (
            <div className="text-center">
              <div id="reader" className="w-full mb-4"></div>
              <button onClick={resetScanner} className="w-full btn-secondary">
                Annuler le Scan
              </button>
            </div>
          )}

          {scannedCode && !scannedProduct && (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scan className="w-8 h-8 text-yellow-600" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">Code scanné !</h3>
              <p className="text-2xl font-mono bg-gray-100 p-3 rounded mb-4">{scannedCode}</p>
              <p className="text-gray-600 mb-4">Produit non trouvé dans la base de données</p>
              
              <button onClick={resetScanner} className="w-full btn-secondary">
                Scanner un autre code
              </button>
            </div>
          )}

          {scannedProduct && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">Produit trouvé !</h3>
              <div className="bg-white p-4 rounded-lg border mb-4">
                <img 
                  src={scannedProduct.images[0]} 
                  alt={scannedProduct.name}
                  className="w-24 h-24 object-cover mx-auto mb-2 rounded"
                />
                <div className="font-semibold">{scannedProduct.name}</div>
                <div className="text-2xl font-bold text-brand-yellow">
                  {scannedProduct.price.toLocaleString()} F
                </div>
                <div className="text-sm text-gray-500">
                  Stock: {scannedProduct.stock}
                </div>
              </div>
              
              <div className="space-y-2">
                <button onClick={addToCart} className="w-full btn-primary">
                  Ajouter au Panier
                </button>
                <button onClick={resetScanner} className="w-full btn-secondary">
                  Scanner un autre produit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}