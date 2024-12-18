import { useMemo } from "react";
import { type TransformedData, type DataItem } from "../../../features/selected/types";
import { type PriceAndIV } from "./index";
import { getOptionPriceAndIV } from "./index";
import Checkbox from "@mui/material/Checkbox";
import ActionButton from "./ActionButton";
import ExpirySelect from "./ExpirySelect";
import StrikeSelect from "./StrikeSelect";
import TypeButton from "./TypeButton";
import LotsSelect from "./LotsSelect";
import PriceInput from "./PriceInput";
import ButtonBase from "@mui/material/ButtonBase";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const getStrikePrices = (dataItems: DataItem[]) => {
  return dataItems.map((item) => item.strikePrice);
};


export type Leg = {
  active: boolean;
  action: "B" | "S";
  expiry: string;
  strike: number;
  type: "CE" | "PE";
  lots: number;
  price: number;
  iv: number | null;
}

type OptionLegProps = {
  priceAndIV: PriceAndIV;
  showHeader?: boolean;
  data: TransformedData;
  expiries: string[];
  legIndexPos: number;
  onChange: (optionLeg: Leg, legIndexPos: number) => void;
  onDelete: (legIndexPos: number) => void;
} & Leg;

const OptionLeg = ({ priceAndIV, showHeader = false, active, data, action, expiries, 
  expiry, strike, type, lots, price, iv, onChange, onDelete, legIndexPos }: OptionLegProps) => {

  const strikes = getStrikePrices(data.grouped[expiry].data);

  const leg = { active, action, expiry, strike, type, lots, price, iv };

  const optionLeg = useMemo(() => {
    const handleActiveChange = () => {
      onChange({ ...leg, active: !active }, legIndexPos);
    };
    
    const handleActionClick = (action: "B" | "S") => {
      onChange({ ...leg, action }, legIndexPos);
    };
  
    const handleExpiryChange = (expiry: string) => {

      if (priceAndIV === null) return;
      const [price, iv] = getOptionPriceAndIV(priceAndIV, type, expiry, strike);

      onChange({ ...leg, expiry, price, iv }, legIndexPos);
    };
  
    const handleStrikeChange = (strike: number) => {

      if (priceAndIV === null) return;
      const [price, iv] = getOptionPriceAndIV(priceAndIV, type, expiry, strike);

      onChange({ ...leg, strike, price, iv }, legIndexPos);
    };
  
    const handleTypeClick = (type: "CE" | "PE") => {

      if (priceAndIV === null) return;
      const [price, iv] = getOptionPriceAndIV(priceAndIV, type, expiry, strike);

      onChange({ ...leg, type, price, iv }, legIndexPos);
    };
  
    const handleLotsChange = (lots: number) => {
      onChange({ ...leg, lots }, legIndexPos);
    };
  
    const handlePriceChange = (price: number) => {
      onChange({ ...leg, price }, legIndexPos);
    };
    
    return (
      <>
        <Checkbox
          sx={{ height: "25px", width: "25px", p: 0, m: 0 }} 
          checked={active}
          onChange={handleActiveChange}
        />
        <ActionButton showHeader={showHeader} action={action} onClick={handleActionClick} />
        <ExpirySelect showHeader={showHeader} data={data} strike={strike} expiries={expiries} expiry={expiry} onChange={handleExpiryChange} />
        <StrikeSelect showHeader={showHeader} strikes={strikes} strike={strike} onChange={handleStrikeChange} />
        <TypeButton showHeader={showHeader} type={type} onClick={handleTypeClick} />
        <LotsSelect showHeader={showHeader} maxLots={150} lots={lots} onChange={handleLotsChange} />
        <PriceInput showHeader={showHeader} price={price} onChange={handlePriceChange} />
        <ButtonBase sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "25px", width: "25px", fontSize: "11px", }}
          onClick={() => onDelete(legIndexPos)}
        >
          <DeleteOutlineIcon />
        </ButtonBase>
      </>
    );
  }, [data, expiry, strike, type, lots, price, iv, active, action, expiries, legIndexPos, showHeader, onChange, onDelete]);
  
  return (
    <div style={{ display: "inline-flex", paddingTop: 1, paddingBottom: 1, gap: 0.5, justifyContent: "space-between", alignItems: "end", minWidth: "395px", width: "100%" }}>
      {optionLeg}
    </div>
  );
};

export default OptionLeg;