'use client';

import { useState } from 'react';

interface PaymentFormProps {
  email: string;
  onSuccess: () => void;
}

export function PaymentForm({ email, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || 'Fehler beim Erstellen der Checkout-Session');
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Keine Checkout-URL erhalten');
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-ink p-6 rounded-sm ">
      <h3 className="text-xl font-semibold mb-4">Zahlung</h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-ink-faint">FrameTrain Early Access</span>
          <span className="font-semibold">4,99 € / Monat</span>
        </div>
        <p className="text-sm text-ink-faint">Abo · jederzeit kündbar · Preis steigt nach 100 Nutzern</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-ghost-fill border border-danger rounded text-danger text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-3 bg-indigo-button text-ink rounded-sm font-semibold hover:bg-indigo-button transition disabled:bg-surface-raised disabled:cursor-not-allowed"
      >
        {loading ? 'Wird verarbeitet...' : 'Jetzt bezahlen mit Stripe'}
      </button>

      <p className="text-xs text-ink-faint text-center mt-4">
        Sichere Zahlung über Stripe. Deine Zahlungsdaten werden verschlüsselt übertragen.
      </p>
    </div>
  );
}
