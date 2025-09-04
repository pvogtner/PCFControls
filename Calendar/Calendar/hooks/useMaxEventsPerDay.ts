import { useState, useEffect } from "react";
import { IInputs } from "../generated/ManifestTypes";

export function useMaxEventsPerDay(pcfContext: ComponentFramework.Context<IInputs>) {
  const [maxEventsPerDay, setMaxEventsPerDay] = useState<number>(
    pcfContext.parameters.maxEventsPerDay?.raw || 3
  );

  useEffect(() => {
    const maxEvents = pcfContext.parameters.maxEventsPerDay?.raw || 3;
    setMaxEventsPerDay(maxEvents);
  }, [pcfContext.parameters.maxEventsPerDay?.raw]);

  return maxEventsPerDay;
}
