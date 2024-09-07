import { useSelector } from 'react-redux';
import { getSBOptionLegs } from '../../../features/selected/selectedSlice';
import { type Greeks } from '../../../features/selected/types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ExpirySelect from './ExpirySelect';
import OptionTableRow from './OptionTableRow';
import { type SelectedOptionsInRow } from './OptionTableRow';

export type Row = {
  putPrice: number | null;
  putOI: number | null;
  strike: number;
  callOI: number | null;
  callPrice: number | null;
  syntheticFuturesPrice: number;
  iv: number | null;
  ceGreeks: Greeks | null;
  peGreeks: Greeks | null;
};

type AddEditLegsProps = {
  rows: Row[];
  expiries: string[];
  selectedExpiry: string | null;
  strikePriceATM: number | null;
  onExpiryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrawerClose: () => void;
};

const AddEditLegs = ({ rows, expiries, selectedExpiry, onExpiryChange, strikePriceATM, onDrawerClose }: AddEditLegsProps) => {

  const optionLegs = useSelector(getSBOptionLegs) || [];

  const maxCallOI = rows.reduce((acc, cur) => {
    return Math.max(acc, cur.callOI || 0);
  }, 0);

  const maxPutOI = rows.reduce((acc, cur) => {
    return Math.max(acc, cur.putOI || 0);
  }, 0);

  const maxOI = Math.max(maxCallOI, maxPutOI);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0, height: "calc(100dvh - 60px)", p: 0 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", columnGap: "10px", 
        alignItems: "center", px: 1, pb: 1, pt: 1.5,  backgroundColor: "background.paper" }}>
        <ExpirySelect
          expiry={selectedExpiry}
          onChange={onExpiryChange}
          expiries={expiries}
        />
        <Button 
          variant="contained" 
          onClick={onDrawerClose}
        >
          Done
        </Button>
      </Box>
      <Box sx={{ display: "flex", maxHeight: "calc(100dvh - 121px)" }}>
        <TableContainer 
          component={Paper}
          sx={{ height: "100%" }}
        >
          <Table
            stickyHeader 
            sx={{ height: "100%", overflowY: "auto" }} 
            aria-label="Add/Edit Legs Table"
          >
            <TableHead>
              <TableRow sx={{ position: "relative", zIndex: 3 }}>
                <TableCell align="left" sx={{ py: "3px", borderRight: 0.5, borderRightColor: "divider", backgroundColor: "background.paper" }}>Delta</TableCell>
                <TableCell align="left" sx={{ py: "3px", borderRight: 0.5, borderRightColor: "divider", backgroundColor: "background.paper" }}>Call LTP</TableCell>
                <TableCell align="center" sx={{ py: "3px", borderRight: 0.5, borderRightColor: "divider", backgroundColor: "background.paper" }}>Strike</TableCell>
                <TableCell align="center" sx={{ py: "3px", borderRight: 0.5, borderRightColor: "divider", backgroundColor: "background.paper" }}>IV</TableCell>
                <TableCell align="right" sx={{ py: "3px", borderRight: 0.5, borderRightColor: "divider", backgroundColor: "background.paper" }}>Put LTP</TableCell>
                <TableCell align="right" sx={{ py: "3px", backgroundColor: "background.paper" }}>Delta</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {

                let selectedOptionsInRow: SelectedOptionsInRow = {
                  CE: {
                    buy: false,
                    sell: false,
                    lots: 1,
                    legIndexPos: null
                  },
                  PE: {
                    buy: false,
                    sell: false,
                    lots: 1,
                    legIndexPos: null
                  }
                };

                optionLegs.forEach((optionLeg, i) => {
                  if (optionLeg.expiry === selectedExpiry && optionLeg.strike === row.strike) {
                    selectedOptionsInRow[optionLeg.type] = {
                      buy: optionLeg.action === "B",
                      sell: optionLeg.action === "S",
                      lots: optionLeg.lots,
                      legIndexPos: i
                    };
                  };
                });

                return (
                  <OptionTableRow 
                    key={row.strike}
                    expiry={selectedExpiry || ""}
                    row={row}
                    strikePriceATM={strikePriceATM}
                    maxOI={maxOI}
                    selectedOptionsInRow={selectedOptionsInRow}
                    numberOfLegs={optionLegs.length}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AddEditLegs;