'use client';

import { useState, useEffect } from 'react';
import { enrollmentService } from '@/services/enrollmentService';
import { useRouter } from 'next/navigation';

interface PaymentModalProps {
  courseId: number;
  userId: number;
  token?: string;
  courseName: string;
  price: number | string; // Aceptar ambos tipos
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

interface Descuento {
  id_canje_recompensa: number;
  nombre: string;
  descripcion: string;
  porcentaje_descuento: number;
  fecha_canje: string;
  imagen_url?: string;
}

export default function PaymentModal({
  courseId,
  userId,
  courseName,
  price: priceProp,
  onClose,
  onPaymentSuccess,
}: PaymentModalProps) {
  // CONVERTIR price a número siempre
  const parsePrice = (price: number | string): number => {
    if (typeof price === 'number') {
      return price;
    } else if (typeof price === 'string') {
      const parsed = parseFloat(price);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const price = parsePrice(priceProp);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDescuentos, setLoadingDescuentos] = useState(false);
  const [error, setError] = useState('');
  const [descuentosDisponibles, setDescuentosDisponibles] = useState<Descuento[]>([]);
  const [descuentoSeleccionado, setDescuentoSeleccionado] = useState<number | null>(null);
  const [mostrarDescuentos, setMostrarDescuentos] = useState(false);
  const router = useRouter();

  // Estado del formulario de tarjeta
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  // Cargar descuentos disponibles al abrir el modal
  useEffect(() => {
    cargarDescuentosDisponibles();
  }, []);

  const cargarDescuentosDisponibles = async () => {
    setLoadingDescuentos(true);
    try {
      const descuentos = await enrollmentService.getDescuentosDisponibles(userId);
      setDescuentosDisponibles(descuentos);
    } catch (error) {
      console.error('Error al cargar descuentos:', error);
    } finally {
      setLoadingDescuentos(false);
    }
  };

  // Calcular precio con descuento
  const calcularPrecioConDescuento = () => {
    if (descuentoSeleccionado) {
      const descuento = descuentosDisponibles.find(d => d.id_canje_recompensa === descuentoSeleccionado);
      if (descuento) {
        const descuentoMonto = price * (descuento.porcentaje_descuento / 100);
        const precioFinal = price - descuentoMonto;
        return {
          precioFinal: Math.max(0, precioFinal),
          descuentoPorcentaje: descuento.porcentaje_descuento,
          descuentoMonto: descuentoMonto,
          tieneDescuento: true
        };
      }
    }
    return {
      precioFinal: price,
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      tieneDescuento: false
    };
  };

  const { precioFinal, descuentoPorcentaje, descuentoMonto, tieneDescuento } = calcularPrecioConDescuento();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({
      ...cardData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación simple de tarjeta (simulación)
    if (cardData.number.length < 16) {
      setError('Número de tarjeta inválido');
      return;
    }

    setIsLoading(true);

    try {
      const result = await enrollmentService.enrollInCourse(
        courseId.toString(),
        'Tarjeta',
        descuentoSeleccionado || undefined
      );

<<<<<<< HEAD
  try {
    const result = await enrollmentService.enrollInCourse(
      courseId.toString(),
      'Tarjeta',
      0
    );

    alert(result.message || `¡Te has inscrito al curso ${courseName}!`);
    onClose();
    router.push(`/payment/success?courseId=${courseId}&userId=${userId}`);
  } catch (err: any) {
    setError(err.message || 'Error al procesar la inscripción');
  } finally {
    setIsLoading(false);
  }
};
=======
      alert(result.message || `¡Te has inscrito al curso ${courseName}!`);
      onClose();
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      router.push(`/payment/success?courseId=${courseId}&userId=${userId}&finalPrice=${precioFinal}&discountAmount=${descuentoMonto}`);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la inscripción');
    } finally {
      setIsLoading(false);
    }
  };
>>>>>>> origin/modal-descuento

  const seleccionarDescuento = (id: number | null) => {
    setDescuentoSeleccionado(id);
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
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        width: '450px', 
        maxWidth: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>Confirmar Inscripción</h2>
        
        {/* Información del curso */}
        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Curso:</strong> {courseName}</p>
          <p>
            <strong>Precio original:</strong> 
            <span style={{ textDecoration: tieneDescuento ? 'line-through' : 'none', color: tieneDescuento ? '#999' : 'inherit' }}>
              ${price.toFixed(2)}
            </span>
          </p>
          
          {/* Mostrar descuento aplicado */}
          {tieneDescuento && (
            <div style={{ 
              backgroundColor: '#e8f5e9', 
              padding: '10px', 
              borderRadius: '4px',
              marginBottom: '10px'
            }}>
              <p style={{ margin: 0, color: '#2e7d32' }}>
                <strong>Descuento aplicado:</strong> {descuentoPorcentaje}% (-${descuentoMonto.toFixed(2)})
              </p>
            </div>
          )}
          
          {/* Precio final */}
          <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'green' }}>
            Total a pagar: ${precioFinal.toFixed(2)}
          </p>
        </div>

        {/* Sección de descuentos */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setMostrarDescuentos(!mostrarDescuentos)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>
              {descuentosDisponibles.length > 0 
                ? `${descuentosDisponibles.length} descuento(s) disponible(s)` 
                : 'Sin descuentos disponibles'}
            </span>
            <span>{mostrarDescuentos ? '▲' : '▼'}</span>
          </button>

          {mostrarDescuentos && (
            <div style={{ 
              marginTop: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              padding: '10px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {loadingDescuentos ? (
                <p>Cargando descuentos...</p>
              ) : descuentosDisponibles.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center' }}>No tienes descuentos disponibles</p>
              ) : (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <button
                      type="button"
                      onClick={() => seleccionarDescuento(null)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: descuentoSeleccionado === null ? '#4CAF50' : '#f5f5f5',
                        color: descuentoSeleccionado === null ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginBottom: '5px'
                      }}
                    >
                      Sin descuento
                    </button>
                  </div>
                  
                  {descuentosDisponibles.map((descuento) => (
                    <div 
                      key={descuento.id_canje_recompensa}
                      style={{ marginBottom: '8px' }}
                    >
                      <button
                        type="button"
                        onClick={() => seleccionarDescuento(descuento.id_canje_recompensa)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: descuentoSeleccionado === descuento.id_canje_recompensa ? '#4CAF50' : '#f5f5f5',
                          color: descuentoSeleccionado === descuento.id_canje_recompensa ? 'white' : '#333',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <strong>{descuento.nombre}</strong>
                            <div style={{ fontSize: '0.9em', color: descuentoSeleccionado === descuento.id_canje_recompensa ? '#e0f2e0' : '#666' }}>
                              {descuento.descripcion}
                            </div>
                          </div>
                          <div style={{ fontWeight: 'bold' }}>
                            {descuento.porcentaje_descuento}%
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        {/* Formulario de pago */}
        <form onSubmit={handlePayment}>
          <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Información de Pago</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Número de Tarjeta</label>
            <input
              type="text"
              name="number"
              placeholder="0000 0000 0000 0000"
              value={cardData.number}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Nombre en la Tarjeta</label>
              <input
                type="text"
                name="name"
                placeholder="Nombre del titular"
                value={cardData.name}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Vencimiento</label>
              <input
                type="text"
                name="expiry"
                placeholder="MM/YY"
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
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                onChange={handleInputChange}
                value={cardData.cvc}
              />
            </div>
          </div>

          {/* Botones */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Procesando...' : `Pagar $${precioFinal.toFixed(2)}`}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{ 
              marginTop: '10px', 
              width: '100%', 
              padding: '10px',
              background: 'none', 
              border: '1px solid #ddd', 
              color: '#666', 
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Cancelar
          </button>
        </form>

        {/* Información adicional */}
        <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
          <p>Esta es una simulación de pago. No se procesarán datos reales.</p>
        </div>
      </div>
    </div>
  );
}