import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, type View, type SlotInfo, type CalendarProps } from 'react-big-calendar';
import { format, startOfWeek, getDay, isSameMonth, isSameYear, startOfDay, endOfDay, endOfWeek, startOfMonth, endOfMonth, parse } from 'date-fns';
import { pl } from 'date-fns/locale';

import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import { CustomCalendarToolbar } from '../CustomCalendarToolbar/CustomCalendarToolbar';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './UniversalCalendar.scss';

const locales = { pl: pl };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export interface CalendarResource {
    id: string;
    firstName?: string;
    lastName?: string;
    department?: string;
}

export type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    eventType: 'shift' | 'task';
    status?: string;
    color?: string;
    allDay?: boolean;
    resourceId?: string | number;
    subTasks?: { id: string; title: string; startTime: string; endTime: string; color?: string }[];
};
const DnDCalendar = withDragAndDrop<CalendarEvent, CalendarResource>(
    Calendar as React.ComponentType<CalendarProps<CalendarEvent, CalendarResource>>
);

const customFormats = {
    monthHeaderFormat: 'LLLL yyyy',
    dayHeaderFormat: 'EEEE, d MMMM yyyy',
    dayFormat: 'EEEE, d LLLL',
    dayRangeHeaderFormat: ({ start, end }: { start: Date, end: Date }) => {
        if (isSameMonth(start, end)) return `od ${format(start, 'd')} do ${format(end, 'd MMMM yyyy', { locale: pl })}`;
        if (isSameYear(start, end)) return `od ${format(start, 'd MMMM', { locale: pl })} do ${format(end, 'd MMMM yyyy', { locale: pl })}`;
        return `od ${format(start, 'd MMMM yyyy', { locale: pl })} do ${format(end, 'd MMMM yyyy', { locale: pl })}`;
    }
};

export interface EventInteractionArgs {
    event: CalendarEvent;
    start: Date | string;
    end: Date | string;
    isAllDay?: boolean;
    resourceId?: string | number;
}

interface UniversalCalendarProps {
    events: CalendarEvent[];
    backgroundEvents?: CalendarEvent[];
    resources?: CalendarResource[];

    onSlotClick?: (slotInfo: SlotInfo) => void;
    onEventClick?: (event: CalendarEvent) => void;
    onEventDrop?: (args: EventInteractionArgs) => void;
    onEventResize?: (args: EventInteractionArgs) => void;

    defaultView?: View;
    onViewChange?: (view: View) => void;
    customWrapperClass?: string;
}

const CustomEventBlock = ({ event }: { event: CalendarEvent }) => {
    if (event.eventType === 'task') {
        return (
            <div className="custom-task-block" style={{ borderLeftColor: event.color || '#ccc' }}>
                <div className="task-header">{event.title}</div>
                <div className="task-time">
                    {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                </div>
            </div>
        );
    }

    const statusClass = event.status === 'absent' ? 'shift-absent' : 'shift-planned';
    return (
        <div className={`custom-shift-block ${statusClass}`}>
            <div className="shift-header">
                <strong>{event.title}</strong>
                <span className="shift-time-main">
                    {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                </span>
            </div>
        </div>
    );
};

export const UniversalCalendar = ({
                                      events,
                                      backgroundEvents = [],
                                      resources,
                                      onSlotClick,
                                      onEventClick,
                                      onEventDrop,
                                      onEventResize,
                                      defaultView = 'week',
                                      onViewChange,
                                      customWrapperClass = ''
                                  }: UniversalCalendarProps) => {
    const [currentView, setCurrentView] = useState<View>(defaultView);
    // ZMIANA: Zmieniliśmy domyślną datę na 8 marca (Niedzielę), co pokaże 1. tydzień!
    const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 2, 8));

    const handleNavigate = (newDate: Date) => setCurrentDate(newDate);

    const handleViewChange = (newView: View) => {
        setCurrentView(newView);
        if (onViewChange) onViewChange(newView);
    };

    const { minTime, maxTime } = useMemo(() => {
        let viewStart: Date, viewEnd: Date;
        if (currentView === 'day') {
            viewStart = startOfDay(currentDate); viewEnd = endOfDay(currentDate);
        } else if (currentView === 'week') {
            viewStart = startOfWeek(currentDate, { locale: pl }); viewEnd = endOfWeek(currentDate, { locale: pl });
        } else {
            viewStart = startOfMonth(currentDate); viewEnd = endOfMonth(currentDate);
        }

        const allEvents = [...events, ...backgroundEvents];
        const visibleEvents = allEvents.filter(event =>
            (event.start >= viewStart && event.start <= viewEnd) ||
            (event.end >= viewStart && event.end <= viewEnd)
        );

        const min = new Date(); min.setHours(6, 0, 0, 0);
        const max = new Date(); max.setHours(22, 0, 0, 0);

        if (visibleEvents.length > 0) {
            const earliestHour = Math.min(...visibleEvents.map(e => e.start.getHours()));
            const latestHour = Math.max(...visibleEvents.map(e => {
                let h = e.end.getHours();
                if (e.end.getMinutes() > 0) h += 1;
                return h;
            }));

            min.setHours(Math.max(0, earliestHour - 1), 0, 0, 0);
            max.setHours(Math.min(23, latestHour + 1), 59, 59, 999);
        }

        return { minTime: min, maxTime: max };
    }, [events, backgroundEvents, currentDate, currentView]);

    const eventStyleGetter = (event: CalendarEvent) => {
        if (event.eventType === 'shift') {
            // Jeśli to zmiana, dajemy klasę w zależności od statusu
            return {
                className: event.status === 'absent' ? 'bg-absent-event' : 'bg-planned-event'
            };
        }
        return {}; // Zadania nie dostają specjalnej klasy z tego poziomu
    };

    return (
        <div className={`universal-calendar-wrapper ${customWrapperClass}`}>
            <DnDCalendar
                localizer={localizer}
                events={events}
                backgroundEvents={backgroundEvents}
                resources={resources}
                resourceIdAccessor={(resource: CalendarResource) => resource.id}
                resourceTitleAccessor={(resource: CalendarResource) => `${resource.firstName} ${resource.lastName}`}

                startAccessor={(event: CalendarEvent) => event.start}
                endAccessor={(event: CalendarEvent) => event.end}
                allDayAccessor={(event: CalendarEvent) => !!event.allDay}

                eventPropGetter={eventStyleGetter}
                culture="pl"
                formats={customFormats}

                view={currentView}
                onView={handleViewChange}
                date={currentDate}
                onNavigate={handleNavigate}

                step={15}
                timeslots={4}
                min={minTime}
                max={maxTime}

                selectable={!!onSlotClick}
                onSelectSlot={onSlotClick}
                onSelectEvent={onEventClick}

                resizable={!!onEventResize}
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                draggableAccessor={() => !!onEventDrop}

                components={{
                    event: CustomEventBlock,
                    toolbar: CustomCalendarToolbar
                }}
            />
        </div>
    );
};