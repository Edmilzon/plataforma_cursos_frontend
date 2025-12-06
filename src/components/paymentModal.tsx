'use client';

import { useState } from 'react';
import { enrollmentService } from '@/services/enrollmentService';
import { useRouter } from 'next/navigation';

interface PaymentModalProps {
  courseId: number;
  userId: number;
  token?: string;
  courseName: string;
  price: number;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export default function PaymentModal({
  courseId,
  userId,
  courseName,
  price,
  onClose,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({
      ...cardData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log("ID recibido en modal:", courseId);

    if (cardData.number.length < 16) {
      setError('Número de tarjeta inválido');
      return;
    }

    setIsLoading(true);

    try {
      const result = await enrollmentService.enrollInCourse(
        courseId.toString(),
        'Tarjeta',
        0
      );

      alert(result.message || `¡Te has inscrito al curso ${courseName}!`);
      if (onPaymentSuccess) onPaymentSuccess();
      onClose();
      router.push(`/payment/success?courseId=${courseId}&userId=${userId}`);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la inscripción');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>Confirmar Inscripción</h2>
        <p>Curso: <strong>{courseName}</strong></p>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Total: <span style={{ color: 'green' }}>${price}</span></p>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Número de Tarjeta</label>
            <input
              type="text"
              name="number"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              value={cardData.number}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          {/* Sección arreglada de Fecha y CVC */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Vencimiento</label>
              <input
                type="text"
                name="expiry"
                placeholder="MM/YY"
                maxLength={5}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                onChange={handleInputChange}
                value={cardData.expiry}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>CVC</label>
              <input
                type="text"
                name="cvc"
                placeholder="000"
                maxLength={4}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                onChange={handleInputChange}
                value={cardData.cvc}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: isLoading ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Procesando...' : 'Pagar e Inscribirse'}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{ marginTop: '10px', width: '100%', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}