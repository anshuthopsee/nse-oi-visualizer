import { type OptionLeg } from '../../../features/selected/types';
import { type Identifier as Underlying, LOTSIZES } from '../../../identifiers';
import Typography from '@mui/material/Typography';

type StrategyInfoProps = {
  underlying: Underlying;
  optionLegs: OptionLeg[];
};

const StrategyInfo = ({ underlying, optionLegs }: StrategyInfoProps) => {

  if (optionLegs.length === 0) return null;

  const lotSize = LOTSIZES.get(underlying) || null;

  const premium = optionLegs.reduce((acc, leg) => {
    if (acc === null || lotSize === null) return acc;
    const sign = leg.action === "B" ? 1 : -1;
    return acc + sign * (leg.price || 0) * leg.lots * lotSize;
  }, 0);

  const price = optionLegs.reduce((acc, leg) => {
    if (acc === null || lotSize === null) return acc;
    const sign = leg.action === "B" ? 1 : -1;
    return acc + sign * (leg.price || 0) * leg.lots;
  }, 0);

  const priceLabel = price < 0 ? "get" : "pay";
  const premiumLabel = premium < 0 ? "get" : "pay";

  return (
    <div style={{ display: "flex", width: "100%", justifyContent: "space-between", columnGap: "10px", alignItems: "center", paddingLeft: 0.5, paddingRight: 0.5 }}>
      <Typography variant="body2">
        {`Price ${priceLabel} ${Math.abs(price).toFixed(2)}`}
      </Typography>
      <Typography variant="body2">
        {`Premium ${premiumLabel} ${Math.abs(premium).toFixed(2)}`}
      </Typography>
    </div>
  );
};

export default StrategyInfo;