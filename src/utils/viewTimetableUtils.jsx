const getRelevantSectionsForBaseSection = (baseSection, allSections) => {
  const relevantSections = [baseSection];

  for (let i = 0; i < 2; i += 1) {
    allSections.forEach((section) => {
      let goodSection = false;
      section.parentSections.forEach((parentSection) => {
        if (relevantSections.includes(parentSection)) goodSection = true;
      });
      if (goodSection) relevantSections.push(section.toString());
    });
  }

  return Array.from(new Set(relevantSections));
};

export const getEventsForBaseSection = (
  baseSection,
  allSections,
  jsonSolution
) => {
  const relevantSections = getRelevantSectionsForBaseSection(
    baseSection,
    allSections
  );
  return jsonSolution.filter((event) =>
    relevantSections.includes(event.section)
  );
};

export const getEventForFaculty = (faculty, jsonSolution) => {
  return jsonSolution.filter((event) => event.faculties.includes(faculty));
};

export const getEventsForRoom = (room, jsonSolution) => {
  return jsonSolution.filter((event) => event.rooms.includes(room));
};

const convertEventToDisplayObject = (event, keyToExclude) => {
  if (!event) return { slotSize: 1, content: '' };

  const content = [];

  if (keyToExclude === 'section') {
    if (event.sectionType !== 'base') {
      content.push(event.sectionLetter);
    }
  } else content.push(`${event.section}`);

  if (keyToExclude !== 'subject') content.push(event.subject);

  if (keyToExclude !== 'faculty') content.push(...event.faculties);

  if (keyToExclude !== 'room') content.push(...event.rooms);

  return {
    slotSize: event.slotSize,
    content: content.join(', '),
  };
};

const insertBlankEventsWhereRequired = (events, minSlot, maxSlot) => {
  const result = [];
  const isFilled = {};

  events.forEach((event) => {
    for (
      let i = event.assignedTimeSlot[1];
      i < event.assignedTimeSlot[1] + event.slotSize;
      i += 1
    ) {
      isFilled[i] = 'ignore';
    }
    isFilled[event.assignedTimeSlot[1]] = event;
  });

  // console.log('xxx  xxx', minSlot, maxSlot, 'slot:', 'result: ', result);

  for (let i = minSlot; i <= maxSlot; i += 1) {
    if (!isFilled[i]) result.push(null);
    else if (isFilled[i] !== 'ignore') result.push(isFilled[i]);
    // console.log('xxx ', minSlot, maxSlot, 'slot:', i, 'result: ', result);
  }

  // console.log(
  // 'xxx isFilled:',
  // isFilled,
  // '\n',
  // 'insert blank: min,max: ',
  // minSlot,
  // maxSlot,
  // 'assigned slot: ',
  // 'Events, result:',
  // events,
  // result
  // );
  return result;
};

/**
 * Converts the set of all events that are to be grouped in a single cell
 * into an array of array.
 * Each inner array contains event objects to be present on 1 row
 *   Format of object = {slotSize, content}
 * The outer array contains rows
 * @param {Set} eventsInCell A set containing all the events that have to come toghether in a single cell
 */
const processEventsInCell = (eventsInCell, keyToExclude) => {
  /* Group by sections */
  const groupedBySection = {};
  eventsInCell.forEach((event) => {
    if (!groupedBySection[event.section]) groupedBySection[event.section] = [];
    groupedBySection[event.section].push(event);
  });

  /* Sort by assignedTimeSlot in each section and convert into desired format */
  let slotsRequired = 1;
  let minSlot = 100;
  let maxSlot = 0;
  const processedCell = [];
  Object.keys(groupedBySection).forEach((section) => {
    groupedBySection[section].sort(
      (event1, event2) =>
        event1.assignedTimeSlot[1] - event2.assignedTimeSlot[1]
    );

    // Calculate min and max slots required
    // And update slotsRequired
    groupedBySection[section].forEach((event) => {
      minSlot = Math.min(minSlot, event.assignedTimeSlot[1]);
      maxSlot = Math.max(
        maxSlot,
        event.assignedTimeSlot[1] + event.slotSize - 1
      );
    });
  });
  slotsRequired = maxSlot - minSlot + 1;
  if (slotsRequired < 1) slotsRequired = 1;

  Object.keys(groupedBySection).forEach((section) => {
    groupedBySection[section] = insertBlankEventsWhereRequired(
      groupedBySection[section],
      minSlot,
      maxSlot
    );
    processedCell.push(
      groupedBySection[section].map((event) =>
        convertEventToDisplayObject(event, keyToExclude)
      )
    );
  });

  return { slotsRequired, events: processedCell };
};

/**
 * Converts solution events to eventGrid that can be used to display
 * events in the TimetableGrid
 * Slots are fixed at 11 */
export const getEventGridFromEvents = (
  events,
  keyToExclude,
  days,
  slots,
  lunchSlot,
  lunchSlotSize
) => {
  const isSlotLunchSlot = (slot) =>
    slot >= lunchSlot && slot < lunchSlot + lunchSlotSize;

  const eventGrid = [];

  const getObject = (slotSize, content) => ({ slotSize, content });

  for (let i = 0; i <= days; i += 1) eventGrid.push([]);

  // eventGrid[0].push([getObject(1, ['Time slots →', 'Days ↓'])]);
  eventGrid[0].push({
    slotsRequired: 1,
    events: [[getObject(1, 'Time slots →')], [getObject(1, 'Days ↓')]],
  });

  // Fill Slot numbers
  for (let i = 1; i <= 11; i += 1) {
    if (i <= slots)
      eventGrid[0].push({
        slotsRequired: 1,
        events: [[getObject(1, `Slot ${i}`)]],
      });
    else eventGrid[0].push(null);
    // eventGrid[0].push(i <= slots ? ([getObject(1, `Slot ${i}`)]) : null));
  }

  // Fill Day numbers
  for (let i = 1; i <= days; i += 1) {
    eventGrid[i].push({
      slotsRequired: 1,
      events: [[getObject(1, `Day ${i}`)]],
    });
  }

  // Fill all cells with empty arrays
  for (let day = 1; day <= days; day += 1) {
    let slotsCarry = 1;
    const eventsInCell = new Set();

    for (let slot = 1; slot <= 11; slot += 1) {
      // console.log('Processing day, slot: ', day, slot);

      // console.log('slotsCarry', slotsCarry);
      if (slot > slots || isSlotLunchSlot(slot)) {
        eventGrid[day].push(null);
        // console.log(
        //   'Processed event: ',
        //   'day, slot: ',
        //   day,
        //   slot,
        //   eventGrid[day][eventGrid[day].length - 1]
        // );
      } else {
        let maxSlotSize = 0;
        events
          .filter(
            (event) =>
              event.assignedTimeSlot[0] === day &&
              event.assignedTimeSlot[1] === slot
          )
          .forEach((event) => {
            // console.log('Got event: ', event);
            eventsInCell.add(event);
            maxSlotSize = Math.max(maxSlotSize, event.slotSize);
          });
        // console.log('After processing slotsCarry', slotsCarry);

        slotsCarry = Math.max(slotsCarry, maxSlotSize);
        // console.log('After mat.max slotsCarry', slotsCarry);

        slotsCarry -= 1;
        // console.log('After processing slotsCarry', slotsCarry);
        if (slotsCarry === 0) {
          eventGrid[day].push(processEventsInCell(eventsInCell, keyToExclude));
          // console.log(
          //   'Processed event: ',
          //   'day, slot: ',
          //   day,
          //   slot,
          //   eventGrid[day][eventGrid[day].length - 1]
          // );

          eventsInCell.clear();
          slotsCarry = 1;
        }
      }
    }
  }

  return eventGrid;
};
