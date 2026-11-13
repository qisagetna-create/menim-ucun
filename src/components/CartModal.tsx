import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, CheckCircle2, Tag } from 'lucide-react';
import { ProductItem } from '../types';
import { useBodyScrollLock } from '../lib/useBodyScrollLock';

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (rawTotal * discountPercent) / 100;
  const finalTotal = Math.max(0, rawTotal - discountAmount);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'QISAGET10') {
      setDiscountPercent(10);
      setPromoMessage('✓ 10% endirim tətbiq edildi!');
    } else {
      setPromoMessage('Xəta: Yanlış promo kod (sınayın: QISAGET10)');
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerEmail.includes('@')) {
      alert('Zəhmət olmasa e-poçt ünvanınızı daxil edin.');
      return;
    }
    setOrderComplete(true);
  };

  const handleFinish = () => {
    onClearCart();
    setOrderComplete(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border-2 border-black rounded-[28px] brutal-shadow p-6 max-h-[90vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center border border-black/20 transition-colors cursor-pointer"
          aria-label="Bağla"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#a5d1f8] border-2 border-black flex items-center justify-center brutal-shadow-sm">
            <ShoppingBag className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black">Qisaget Səbəti</h3>
            <p className="text-xs text-neutral-500">
              {cart.length === 0 ? 'Səbətiniz boşdur' : `${cart.length} məhsul seçildi`}
            </p>
          </div>
        </div>

        {orderComplete ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-black">Sifarişiniz Qəbul Edildi!</h4>
              <p className="text-xs text-neutral-600 mt-2 max-w-xs mx-auto">
                Təşəkkür edirik! Rəqəmsal yükləmə linkləri və qəbz <b>{customerEmail}</b> ünvanına göndərildi.
              </p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-black/10 text-xs font-mono">
              Sifariş №: QSG-{Math.floor(100000 + Math.random() * 900000)}
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              Mağazaya qayıt
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-neutral-500">Hazırda səbətinizdə heç bir məhsul yoxdur.</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              Məhsullara Bax
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Items list */}
            <div
              data-scroll-container="true"
              className="flex-1 overflow-y-auto overscroll-contain space-y-2.5 pr-1 modal-scrollable-content"
              style={{ overscrollBehavior: 'contain' }}
            >
              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-neutral-50 border border-black/15 rounded-2xl"
                >
                  <div
                    className="w-12 h-12 rounded-xl border border-black/20 shrink-0 bg-white overflow-hidden flex items-center justify-center p-0.5"
                    style={{ background: product.imageUrl ? '#ffffff' : product.gradient }}
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="w-full h-full object-contain" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-black truncate">{product.title}</h5>
                    <p className="text-xs text-neutral-600 font-semibold">
                      {product.price} {product.currency}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                      className="w-6 h-6 rounded-md bg-white border border-black/20 text-xs font-bold hover:bg-neutral-200"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold tabular-nums">{quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-black/20 text-xs font-bold hover:bg-neutral-200"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors ml-1"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <form onSubmit={applyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Promo kod (məs: QISAGET10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-black/30 font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-black text-xs font-bold rounded-xl transition-colors"
              >
                Tətbiq et
              </button>
            </form>
            {promoMessage && (
              <p
                className={`text-[11px] font-semibold ${
                  promoMessage.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {promoMessage}
              </p>
            )}

            {/* Checkout total & user info */}
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <div className="flex justify-between text-xs text-neutral-600">
                <span>Cəmi:</span>
                <span className="tabular-nums font-semibold">{rawTotal} AZN</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                  <span>Endirim ({discountPercent}%):</span>
                  <span className="tabular-nums">-{discountAmount.toFixed(1)} AZN</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-black border-t border-neutral-200 pt-2">
                <span>Yekun Məbləğ:</span>
                <span className="tabular-nums">{finalTotal.toFixed(1)} AZN</span>
              </div>

              <input
                type="email"
                required
                placeholder="Çatdırılma üçün e-poçtunuz *"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black"
              />

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 brutal-shadow-sm transition-all flex items-center justify-center gap-2 mt-1"
              >
                <span>Sifarişi Təsdiqlə ({finalTotal.toFixed(1)} AZN)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
