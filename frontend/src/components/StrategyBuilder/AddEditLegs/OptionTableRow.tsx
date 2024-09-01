import { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { setSBOptionLegs, type OptionLegPayload } from '../../../features/selected/selectedSlice';
import { type OptionLeg } from '../../../features/selected/types';
import { ToastContext } from '../../../contexts/ToastContextProvider';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { type Row } from '.';
import ActionButtons from './ActionButtons';
import LotsSelect from './LotsSelect';

const getTableCellColor = (strikePriceATM: number | null, strike: number, type: "PE" | "CE") => {
  if (strikePriceATM === null) return "transparent";
  if (type === "PE" && strike > strikePriceATM) return "tableCell.itm";
  if (type === "CE" && strike < strikePriceATM) return "tableCell.itm";
  if (strike === strikePriceATM) return "tableCell.atm";
  return "transparent";
};

const getOIHighlighterWidth = (oi: number, maxOI: number) => {
  return `${(oi / maxOI) * 100}%`;
};

const showNonZeroVal = (val: number | undefined | null, isIV = false) => {
  const precesion = isIV ? 1 : 2;
  const multiplier = isIV ? 100 : 1;
  if (!val || Number(Math.abs(val).toFixed(precesion)) === 0) return "-";

  return (val * multiplier).toFixed(precesion);
};

export type SelectedOptionsInRow = {
  CE: {
    buy: boolean;
    sell: boolean;
    lots: number;
    legIndexPos: number | null;
  },
  PE: {
    buy: boolean;
    sell: boolean;
    lots: number;
    legIndexPos: number | null;
  }
};

type OptionTableRowProps = {
  row: Row;
  expiry: string;
  strikePriceATM: number | null;
  maxOI: number;
  selectedOptionsInRow: SelectedOptionsInRow;
  numberOfLegs: number;
};

const OptionTableRow = ({ row, strikePriceATM, maxOI, expiry, selectedOptionsInRow, numberOfLegs }: OptionTableRowProps) => {
  
  const { setToastPack } = useContext(ToastContext);
  const dispatch = useDispatch();
  const optionTableRowRef = useRef<HTMLTableRowElement>(null);
  const [rowHovered, setRowHovered] = useState(false);
  const putCellBgColor = getTableCellColor(strikePriceATM, row.strike, "PE");
  const callCellBgColor = getTableCellColor(strikePriceATM, row.strike, "CE");
  const strikeCellColor = (strikePriceATM && row.strike === strikePriceATM) ? "tableCell.atm" : "transparent";

  const showCEActions = rowHovered || (selectedOptionsInRow.CE.buy || selectedOptionsInRow.CE.sell);
  const showPEActions = rowHovered || (selectedOptionsInRow.PE.buy || selectedOptionsInRow.PE.sell);

  const showCELots = (selectedOptionsInRow.CE.buy || selectedOptionsInRow.CE.sell);
  const showPELots = (selectedOptionsInRow.PE.buy || selectedOptionsInRow.PE.sell);

  const handleMouseOver = () => {
    setRowHovered(true);
  };

  const handleMouseOut = () => {
    setRowHovered(false);
  };

  const handleAction = (type: "CE" | "PE", action: "B" | "S") => {
    const existingLegLots = selectedOptionsInRow[type].lots;
    const existingLegAction = selectedOptionsInRow[type].buy ? "B" : "S";

    const optionLeg: OptionLeg = {
      active: true,
      action: action,
      strike: row.strike,
      type: type,
      lots: existingLegLots,
      expiry: expiry,
      price: type === "CE" ? row.callPrice : row.putPrice,
      iv: row.iv
    };

    const legIndexPos = selectedOptionsInRow[type].legIndexPos;

    let updateType = legIndexPos === null ? "add" : existingLegAction === action ? "delete" : "replace";

    if (updateType === "add" && numberOfLegs >= 10) {
      const message = "Maximum 10 legs allowed in a strategy";
      const toastType = "warning";
      setToastPack((prev) => [...prev, { message, type: toastType, key: new Date().getTime() }]);
      return;
    };

    const payload: OptionLegPayload = {
      type: updateType,
      optionLeg,
      ...((updateType === "delete" || updateType === "replace") && {optionLegIndex: legIndexPos})
    } as OptionLegPayload;

    dispatch(setSBOptionLegs(payload));
  };

  const handleLotsChange = (type: "CE" | "PE", lots: number) => {
    const optionLeg: OptionLeg = {
      active: true,
      action: selectedOptionsInRow[type].buy ? "B" : "S",
      strike: row.strike,
      type: type,
      lots: lots,
      expiry: expiry,
      price: type === "CE" ? row.callPrice : row.putPrice,
      iv: row.iv
    };

    const legIndexPos = selectedOptionsInRow[type].legIndexPos;

    // updateType here is always "replace"
    let updateType = legIndexPos === null ? "add" : "replace";

    const payload: OptionLegPayload = {
      type: updateType,
      optionLeg,
      ...(updateType === "replace" && {optionLegIndex: legIndexPos})
    } as OptionLegPayload;

    dispatch(setSBOptionLegs(payload));
  };

  useEffect(() => {
    const row = optionTableRowRef.current;
    if (row) {
      row.addEventListener("mouseover", handleMouseOver);
      row.addEventListener("mouseout", handleMouseOut);

      return () => {
        row.removeEventListener("mouseover", handleMouseOver);
        row.removeEventListener("mouseout", handleMouseOut);
      };
    };
  }, []);

  return (
    <TableRow
      ref={optionTableRowRef}
      key={row.strike}
      sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
    >
      <TableCell align="center" sx={{ py: "7px", px: "10px", fontSize: "12px", borderRight: 0.5, width: "50px",
        verticalAlign: "top", borderRightColor: "divider", backgroundColor: strikeCellColor }}
      >
        <div style={{ display: "flex", height: "25px", alignItems: "center", justifyContent: "center", 
          borderRadius: "2px" }}>
          {showNonZeroVal(row.ceGreeks?.delta)}
        </div>
      </TableCell>
      <TableCell align="left" sx={{ py: "7px", px: 0, fontSize: "12px", position: "relative", verticalAlign: "top", borderRight: 0.5, 
        borderRightColor: "divider", backgroundColor: callCellBgColor }}>
        <div style={{ display: "flex", height: "100%", alignItems: "start", position: "relative" }}>
          <div style={{ display: "flex", height: "25px", alignItems: "center", position: "relative", justifyContent: "flex-start", width: "100%" }}>
            <span style={{ paddingLeft: "10px", zIndex: 1 }}>{showNonZeroVal(row.callPrice)}</span>
            <div style={{ right: 0, position: "absolute", height: "25px", width: getOIHighlighterWidth(row.callOI || 0, maxOI),
              backgroundColor: "rgba(235, 52, 52, 0.3)", borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px" }} 
            />
          </div>
          <div style={{ position: "absolute", right: "10px", height: "100%", display: "flex", alignItems: 'start', zIndex: 2 }}>
            <ActionButtons type="CE" show={showCEActions} buyActive={selectedOptionsInRow.CE.buy} sellActive={selectedOptionsInRow.CE.sell} onAction={handleAction} />
          </div>
        </div>
        {showCELots && (
          <div style={{ display: "flex", paddingRight: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
            <LotsSelect type="CE" lots={selectedOptionsInRow.CE.lots} onChange={handleLotsChange} />
          </div>
        )}
      </TableCell>
      <TableCell align="center" sx={{ py: "7px", px: "10px", fontSize: "12px", borderRight: 0.5, width: "70px",
        verticalAlign: "top", borderRightColor: "divider", backgroundColor: strikeCellColor }}
      >
        <div style={{ display: "flex", height: "25px", alignItems: "center", justifyContent: "center", 
          borderRadius: "2px", backgroundColor: "color-mix(in srgb, currentColor 10%, transparent)" }}>
          {row.strike}
        </div>
      </TableCell>
      <TableCell align="center" sx={{ py: "7px", px: "10px", fontSize: "12px", borderRight: 0.5, width: "50px",
        verticalAlign: "top", borderRightColor: "divider", backgroundColor: strikeCellColor }}
      >
        <div style={{ display: "flex", height: "25px", alignItems: "center", justifyContent: "center", 
          borderRadius: "2px" }}>
          {showNonZeroVal(row.iv, true)}
        </div>
      </TableCell>
      <TableCell align="right" sx={{ py: "9px", px: 0, fontSize: "12px", position: "relative", verticalAlign: "top", borderRight: 0.5, 
        borderRightColor: "divider", backgroundColor: putCellBgColor }}>
        <div style={{ display: "flex", height: "100%", alignItems: "start", position: "relative" }}>
          <div style={{ display: "flex", height: "22px", alignItems: "center", position: "relative", justifyContent: "flex-end", width: "100%" }}>
            <span style={{ paddingRight: "10px", zIndex: 1, }}>{showNonZeroVal(row.putPrice)}</span>
            <div style={{ left: 0, position: "absolute", height: "22px", width: getOIHighlighterWidth(row.putOI || 0, maxOI),
              backgroundColor: "rgba(21, 212, 88, 0.3)", borderTopRightRadius: "20px", borderBottomRightRadius: "20px" }} 
            />
          </div>
          <div style={{ position: "absolute", left: "10px", height: "100%", display: "flex", alignItems: 'start', zIndex: 2 }}>
            <ActionButtons type="PE" show={showPEActions} buyActive={selectedOptionsInRow.PE.buy} sellActive={selectedOptionsInRow.PE.sell} onAction={handleAction} />
          </div>
        </div>
        {showPELots && (
          <div style={{ display: "flex", paddingLeft: "10px", justifyContent: "flex-start", marginTop: "10px" }}>
            <LotsSelect type="PE" lots={selectedOptionsInRow.PE.lots} onChange={handleLotsChange} />
          </div>
        )}
      </TableCell>
      <TableCell align="center" sx={{ py: "9px", px: "10px", fontSize: "12px", borderRight: 0.5, width: "50px",
        verticalAlign: "top", borderRightColor: "divider", backgroundColor: strikeCellColor }}
      >
        <div style={{ display: "flex", height: "22px", alignItems: "center", justifyContent: "center", 
          borderRadius: "2px" }}>
          {showNonZeroVal(row.peGreeks?.delta)}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default OptionTableRow;