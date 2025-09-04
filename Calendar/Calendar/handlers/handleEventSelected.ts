import { IInputs } from "../generated/ManifestTypes";
import { IEvent } from "../types";

// Type declarations for Xrm API
interface XrmPageInput {
  pageType: string;
  entityName: string;
  entityId?: string;
  data?: Record<string, string>;
}

interface XrmNavigationOptions {
  target: number;
  height?: { value: number; unit: string };
  width?: { value: number; unit: string };
  position?: number;
}

declare global {
  interface Window {
    Xrm?: {
      Navigation?: {
        navigateTo: (pageInput: XrmPageInput, navigationOptions?: XrmNavigationOptions) => Promise<void>;
      };
    };
  }
}

function navigateToRecord(
  pageInput: XrmPageInput,
  navigationOptions: XrmNavigationOptions,
  pcfContext: ComponentFramework.Context<IInputs>,
  eventId: string
): void {
  if (typeof window.Xrm !== 'undefined' && window.Xrm.Navigation) {
    window.Xrm.Navigation.navigateTo(pageInput, navigationOptions).catch(() => {
      // Fallback to openForm on error
      pcfContext.navigation.openForm({
        entityId: eventId,
        entityName: pcfContext.parameters.calendarDataSet.getTargetEntityType(),
        openInNewWindow: false,
      });
    });
  } else {
    // Fallback to original openForm if Xrm.Navigation is not available
    pcfContext.navigation.openForm({
      entityId: eventId,
      entityName: pcfContext.parameters.calendarDataSet.getTargetEntityType(),
      openInNewWindow: false,
    });
  }
}

export function handleEventSelected(
  isEventSelectable: boolean,
  onClickSelectedRecord: (id: string) => void,
  pcfContext: ComponentFramework.Context<IInputs>
) {
  return (event: IEvent) => {
    if (!isEventSelectable) {
      return;
    }

    const eventId = event.id as string;
    onClickSelectedRecord(eventId);

    if (pcfContext.mode.allocatedHeight === -1) {
      // Use Xrm.Navigation.navigateTo for modal dialog with fallback to openForm
      const pageInput: XrmPageInput = {
        pageType: "entityrecord",
        entityName: pcfContext.parameters.calendarDataSet.getTargetEntityType(),
        entityId: eventId
      };

      const navigationOptions: XrmNavigationOptions = {
        target: 2, // Open in dialog
        height: { value: 60, unit: "%" },
        width: { value: 60, unit: "%" },
        position: 1 // Centered
      };

      navigateToRecord(pageInput, navigationOptions, pcfContext, eventId);
    }
  };
}
