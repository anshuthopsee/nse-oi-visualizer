import { useEffect, useRef } from 'react';
import fastDeepEqual from 'fast-deep-equal';

export const useEffectSingleRender = (effect: React.EffectCallback, deps: unknown[]) => {
  const previousDepsRef = useRef<unknown[]>([]);
  const shouldRenderRef = useRef(true);

  if (!fastDeepEqual(deps, previousDepsRef.current)) {
    shouldRenderRef.current = true;
  };

  useEffect(() => {
    if (shouldRenderRef.current) {
      const cleanUpFn = effect()
      previousDepsRef.current = [...deps];
      shouldRenderRef.current = false;
      return cleanUpFn;
    };
  }, deps);
};