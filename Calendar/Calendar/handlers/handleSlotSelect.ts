import * as CalendarUtils from "../utils";
import { Resource, Keys } from "../types";
import { SlotInfo as RBCSlotInfo } from "react-big-calendar";
import { IInputs } from "../generated/ManifestTypes";

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

// Accepts the normalized SlotInfo with resourceId as string | undefined
export interface SlotInfo extends Omit<RBCSlotInfo, "resourceId"> {
    resourceId?: string;
}

interface CalendarData {
    keys?: Keys;
    resources?: Resource[];
}

export function handleSlotSelect(
    onClickSlot: (start: Date, end: Date, resourceId: string) => void,
    pcfContext: ComponentFramework.Context<IInputs>,
    calendarData: CalendarData
) {
    return (slotInfo: SlotInfo) => {
        // slotInfo.resourceId is always string | undefined here
        onClickSlot(slotInfo.start, slotInfo.end, slotInfo.resourceId || "");

        if (pcfContext.mode.allocatedHeight === -1) {
            const newRecordProperties: { [key: string]: string } = {};

            if (calendarData.keys?.start) {
                newRecordProperties[calendarData.keys.start] =
                    CalendarUtils.formatDateAsParameterString(slotInfo.start);
            }
            if (calendarData.keys?.end) {
                newRecordProperties[calendarData.keys.end] =
                    CalendarUtils.formatDateAsParameterString(slotInfo.end);
            }

            if (
                calendarData.keys?.resource &&
                slotInfo.resourceId &&
                Array.isArray(calendarData.resources)
            ) {
                const resourceInfo = calendarData.resources.find(
                    (x) => x.id === slotInfo.resourceId
                );
                if (resourceInfo) {
                    newRecordProperties[calendarData.keys.resource] = resourceInfo.id;
                    if (calendarData.keys.resource + "name" in resourceInfo) {
                        newRecordProperties[calendarData.keys.resource + "name"] =
                            resourceInfo.title;
                    }
                    if (calendarData.keys.resource + "type" in resourceInfo) {
                        newRecordProperties[calendarData.keys.resource + "type"] =
                            resourceInfo.etn as string;
                    }
                }
            }

            // Use Xrm.Navigation.navigateTo for modal dialog with fallback to openForm
            const pageInput: XrmPageInput = {
                pageType: "entityrecord",
                entityName: pcfContext.parameters.calendarDataSet.getTargetEntityType() || "",
                data: newRecordProperties
            };

            const navigationOptions: XrmNavigationOptions = {
                target: 2, // Open in dialog
                height: { value: 60, unit: "%" },
                width: { value: 60, unit: "%" },
                position: 1 // Centered
            };

            navigateToNewRecord(pageInput, navigationOptions, pcfContext, newRecordProperties);
        }
    };
}

// Helper function to navigate to new record
function navigateToNewRecord(
    pageInput: XrmPageInput,
    navigationOptions: XrmNavigationOptions,
    pcfContext: ComponentFramework.Context<IInputs>,
    fallbackProperties: { [key: string]: string }
): void {
    if (window.Xrm && window.Xrm.Navigation && window.Xrm.Navigation.navigateTo) {
        void window.Xrm.Navigation.navigateTo(pageInput, navigationOptions)
            .catch(() => {
                // Fallback to openForm if navigateTo fails
                pcfContext.navigation.openForm(
                    {
                        entityName: pageInput.entityName,
                        openInNewWindow: false,
                    },
                    fallbackProperties
                );
            });
    } else {
        // Fallback to openForm if Xrm.Navigation is not available
        pcfContext.navigation.openForm(
            {
                entityName: pageInput.entityName,
                openInNewWindow: false,
            },
            fallbackProperties
        );
    }
}
