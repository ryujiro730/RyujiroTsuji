import React from "react";

interface TradeButtonsProps {
  sellPrice: number;
  buyPrice: number;
  onSellClick: () => void;
  onBuyClick: () => void;
}

const TradeButtons: React.FC<TradeButtonsProps> = ({
  sellPrice,
  buyPrice,
  onSellClick,
  onBuyClick,
}) => {
  const spread = (buyPrice - sellPrice).toFixed(1);

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-2 z-50">
      <button
        onClick={onSellClick}
        className="bg-red-100 text-red-700 border border-red-400 px-3 py-1 rounded-md shadow-sm text-sm hover:bg-red-200"
      >
        <div className="font-bold">{sellPrice.toFixed(3)}</div>
        <div className="text-xs">売り</div>
      </button>

      <div className="text-sm text-gray-600 font-semibold">{spread}</div>

      <button
        onClick={onBuyClick}
        className="bg-blue-100 text-blue-700 border border-blue-400 px-3 py-1 rounded-md shadow-sm text-sm hover:bg-blue-200"
      >
        <div className="font-bold">{buyPrice.toFixed(3)}</div>
        <div className="text-xs">買い</div>
      </button>
    </div>
  );
};

export default TradeButtons;
