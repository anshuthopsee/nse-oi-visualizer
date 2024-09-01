import { useRef } from "react";
import { dequal } from "dequal";

const useDeepMemo = <T,>(value: T): T => {
  const prevValueRef = useRef<T | null>(null);

  const isDeepEqual = dequal(prevValueRef.current, value);

  if (isDeepEqual && prevValueRef.current !== null) {
    return prevValueRef.current;
  }

  prevValueRef.current = value;

  return value;
};

export default useDeepMemo;