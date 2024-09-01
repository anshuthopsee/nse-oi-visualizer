
type CrosshairProps = {
  show: boolean;
  x: number;
  y: number;
  boundedHeight: number;
  boundedWidth: number;
};

const Crosshair = ({ show, x, y, boundedHeight, boundedWidth }: CrosshairProps) => {

  if (!show) return null;

  return (
    <>
      <line x1={x} y1={0} x2={x} y2={boundedHeight} stroke="currentColor" opacity={0.5} strokeWidth={1} />
      <line x1={0} y1={y} x2={boundedWidth} y2={y} stroke="currentColor" opacity={0.5} strokeWidth={1} />
      <circle cx={x} cy={y} r={4} fill="currentColor" opacity={0.5} />
    </>
  )
}

export default Crosshair