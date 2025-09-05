import "react-big-calendar/lib/css/react-big-calendar.css";
import "./css/react-big-calendar.override.css";
import * as React from "react";
import { IInputs } from "./generated/ManifestTypes";
import { Calendar, momentLocalizer, View, SlotInfo, EventProps,  ResourceHeaderProps } from "react-big-calendar";
import * as CalendarUtils from "./utils";
import { StartOfWeek } from "date-arithmetic";
import { IEvent, Resource } from "./types";
import GetMessages from "./components/Translations";
import * as moment from "moment";
import { useCalendarHourRange, useDayLayoutAlgorithm, useEventSelectable, useCalendarSelectable, useCalendarStepAndTimeslots, useCalendarDate, useCalendarPopup, useEventHeaderFormat, useCalendarView, useCalendarData, useCalendarColors, useResourceFilter, useEventTypeFilter } from "./hooks";
import { eventPropsGetter, dayPropsGetter } from "./getters";
import { handleSlotSelect, handleEventSelected, handleEventKeyPress, handleOnView, handleNavigate } from "./handlers";
import { timeGutterHeaderRenderer, resourceHeaderRenderer, agendaEventRenderer,timeSlotWrapperRenderer } from "./renderers";
import { tooltipAccessor } from "./accessors/tooltipAccessor";
import { ResourceFilter } from "./components/ResourceFilter";
import { EventTypeFilter } from "./components/EventTypeFilter";

export interface IProps {
  pcfContext: ComponentFramework.Context<IInputs>;
  onClickSelectedRecord: (recordId: string) => void;
  onClickSlot: (start: Date, end: Date, resourceId: string) => void;
  onCalendarChange: (
    date: Date,
    rangeStart: Date,
    rangeEnd: Date,
    view: View
  ) => void;
}

export const CalendarControl: React.FC<IProps> = (props) => {
  const localizer = momentLocalizer(moment);
  localizer.startOfWeek = (culture: string): StartOfWeek => {
    let weekStart: StartOfWeek;

    if (weekStartDay && weekStartDay > 0) {
      weekStart = (weekStartDay - 1) as StartOfWeek;
    } else {
      const data = culture ? moment.localeData(culture) : moment.localeData();
      const calculatedWeekStart = data ? data.firstDayOfWeek() : 0;
      weekStart = Math.min(Math.max(calculatedWeekStart, 0), 6) as StartOfWeek;
    }

    return weekStart;
  };

  const weekStartDay = props.pcfContext.parameters.calendarWeekStart?.raw || null;
  const calendarCulture = CalendarUtils.getISOLanguage(props.pcfContext);
  const calendarMessages = GetMessages(calendarCulture);
  const calendarRtl = props.pcfContext.userSettings.isRTL;
  const calendarScrollTo = moment()
    .set({
      hour: props.pcfContext.parameters.calendarScrollToTime?.raw || 0,
      minute: 0,
      seconds: 0,
    })
    .toDate();

  const { min, max } = useCalendarHourRange(props.pcfContext, moment);
  const { step, timeslots } = useCalendarStepAndTimeslots(props.pcfContext);
  const dayLayoutAlgorithm = useDayLayoutAlgorithm(props.pcfContext);
  const calendarSelectable = useCalendarSelectable(props.pcfContext);
  const isEventSelectable = useEventSelectable(props.pcfContext);
  const calendarPopup = useCalendarPopup(props.pcfContext);
  const calendarViews = CalendarUtils.getCalendarViews(
    props.pcfContext,
    localizer
  );
  const eventHeaderFormat = useEventHeaderFormat(props.pcfContext);
  const [calendarView, setCalendarView] = useCalendarView(
    calendarViews,
    props.pcfContext.parameters.calendarView?.raw || ""
  );
  const setCalendarViewString = (view: string) => setCalendarView(view as View);
  const [calendarDate, setCalendarDate] = useCalendarDate(props.pcfContext, moment);
  const calendarRef = React.useRef(null);
  const [calendarData, setCalendarData] = useCalendarData(props.pcfContext);
  const resourceField = props.pcfContext.parameters.resourceField?.raw || null;
  const [filteredCalendarData, setSelectedResourceId] = useResourceFilter(calendarData, resourceField);
  const eventTypeField = calendarData.keys?.eventTypeField || null;
  const [eventTypeFilteredData, setSelectedEventType] = useEventTypeFilter(filteredCalendarData, eventTypeField);

  React.useEffect(() => {
    if (calendarDate && calendarView) {
      _onCalendarChange();
    }
  }, [calendarDate, calendarView]);

  const {
    eventDefaultBackgroundColor,
    calendarTodayBackgroundColor,
    calendarTextColor,
    calendarBorderColor,
    calendarTimeBarBackgroundColor,
    weekendColor,
  } = useCalendarColors(props.pcfContext, eventHeaderFormat);

  const _handleEventSelected = handleEventSelected(
    isEventSelectable,
    props.onClickSelectedRecord,
    props.pcfContext
  );

  const _handleEventKeyPress = handleEventKeyPress(_handleEventSelected);

  const _handleSlotSelect = (slotInfo: SlotInfo) =>
    handleSlotSelect(props.onClickSlot, props.pcfContext, {
      keys: calendarData.keys,
      resources: filteredCalendarData.resources
    })({
      ...slotInfo,
      resourceId: slotInfo.resourceId ? String(slotInfo.resourceId) : undefined,
    });

  const _handleNavigate = handleNavigate(setCalendarDate, setCalendarViewString);

  const _handleOnView = handleOnView(setCalendarViewString);

  const _onCalendarChange = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ref = calendarRef.current as any;
    const rangeDates = CalendarUtils.getCurrentRange(
      calendarDate,
      ref.props.view,
      ref.props.culture
    );
    props.onCalendarChange(
      ref.props.date,
      rangeDates.start,
      rangeDates.end,
      ref.props.view
    );
  };

  const _eventPropsGetter = (event: IEvent, start: Date, end: Date, isSelected: boolean) =>
    eventPropsGetter(event, isEventSelectable, eventDefaultBackgroundColor, calendarBorderColor);

  const _dayPropsGetter = (date: Date, _resourceId?: string | number) =>
    dayPropsGetter(date, calendarTodayBackgroundColor, weekendColor, moment);

  const agendaEvent: React.ComponentType<EventProps<IEvent>> = (props) =>
    agendaEventRenderer(props, isEventSelectable, eventDefaultBackgroundColor);

  const resourceHeader: React.ComponentType<ResourceHeaderProps<Resource>> = (props) =>
    resourceHeaderRenderer(props);

  const timeGutterHeader: React.ComponentType = () => {
    const ref = calendarRef.current// as any;
    return timeGutterHeaderRenderer(ref);
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '10px', paddingRight: '10px' }}>
      {/* Show filters side by side if we have resources or event types */}
      {((filteredCalendarData.resources && filteredCalendarData.resources.length > 0) || 
        (eventTypeFilteredData.eventTypes && eventTypeFilteredData.eventTypes.length > 0)) && (
        <div style={{ 
          flexShrink: 0, 
          display: 'flex', 
          gap: '16px', 
          flexWrap: 'wrap',
          marginBottom: '12px'
        }}>
          {/* Resource filter */}
          {filteredCalendarData.resources && filteredCalendarData.resources.length > 0 && (
            <div style={{ flex: '1', minWidth: '250px' }}>
              <ResourceFilter
                resources={filteredCalendarData.resources}
                selectedResourceId={filteredCalendarData.selectedResourceId}
                onResourceChange={setSelectedResourceId}
                calendarTextColor={calendarTextColor.hex()}
                calendarBorderColor={calendarBorderColor.hex()}
              />
            </div>
          )}
          
          {/* Event type filter */}
          {eventTypeFilteredData.eventTypes && eventTypeFilteredData.eventTypes.length > 0 && (
            <div style={{ flex: '1', minWidth: '250px' }}>
              <EventTypeFilter
                eventTypes={eventTypeFilteredData.eventTypes}
                selectedEventType={eventTypeFilteredData.selectedEventType}
                onEventTypeChange={setSelectedEventType}
                calendarTextColor={calendarTextColor.hex()}
                calendarBorderColor={calendarBorderColor.hex()}
              />
            </div>
          )}
        </div>
      )}
      
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0, position: 'relative' }}>
        <Calendar
          selectable={calendarSelectable}
          popup={true}
          localizer={localizer}
          date={calendarDate}
          culture={calendarCulture}
          rtl={calendarRtl}
          messages={calendarMessages}
          defaultView={calendarView}
          view={calendarView}
          views={calendarViews}
          scrollToTime={calendarScrollTo}
          min={min}
          max={max}
          step={step}
          timeslots={timeslots}
          dayLayoutAlgorithm={dayLayoutAlgorithm}
          events={eventTypeFilteredData.events}
          onSelectEvent={_handleEventSelected}
          onKeyPressEvent={_handleEventKeyPress}
          onSelectSlot={_handleSlotSelect}
          onNavigate={_handleNavigate}
          onView={_handleOnView}
          ref={calendarRef}
          className={`rbc-view-${calendarView}`}
          eventPropGetter={_eventPropsGetter}
          dayPropGetter={_dayPropsGetter}
          tooltipAccessor={tooltipAccessor}
          components={{
            agenda: {
              event: agendaEvent,
            },
            timeGutterHeader: timeGutterHeader,
            timeSlotWrapper: (props) => timeSlotWrapperRenderer({ ...props, timeslots }),
          }}
        />
      </div>
    </div>
  );
};