import { useMemo } from "react";
import { useTheme } from "@mui/material/styles"
import * as d3 from "d3";
import { type ScaleLinear } from "d3";
import { PayoffAt } from "../../../features/selected/types";

type PNLAtTargetLineProps = {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  boundedHeight: number;
  payoffsAtTarget: PayoffAt[];
};

const Line = ({ xScale, yScale, payoffsAtTarget }: PNLAtTargetLineProps) => {

  const theme = useTheme();

  const line = useMemo(() => {
   return d3.line<PayoffAt>()
   .x((d) => xScale((d.at) || 0))
   .y((d) => yScale(Math.round(d.payoff)));
  }, [xScale, yScale, payoffsAtTarget]);

  return (
    <g>
      <path
        d={line(payoffsAtTarget) || ""}
        fill="none"
        stroke={theme.palette.primary.main}
        strokeWidth={2}
      />
    </g>
  );
};

export default Line;