/* eslint-disable object-shorthand */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import React from 'react';

import MyTooltip from '../components/MyTooltip/MyTooltip';

export const utilityFunctions = {
  getColumnObjectForDataTable: (id, name, flex, tooltipTitle = null) => {
    return {
      field: id,
      headerName: (() =>
        tooltipTitle ? (
          <MyTooltip title={tooltipTitle}>
            <div>{name}</div>
          </MyTooltip>
        ) : (
          name
        ))(),
      flex,
    };
  },

  blankCheck: (name) => {
    const cleanName = name.replace(/\s/g, '');
    if (cleanName.length === 0) return false;
    return true;
  },

  sectionToSectionId: (letter, branch, year) => `${letter},${branch},${year}`,

  sectionStringToSection: (sectionString) => {
    let cleanSectionString = sectionString.replace(/Sec-/, '');
    cleanSectionString = cleanSectionString.replace(/Year-/, '');
    const sectionInList = cleanSectionString.split(' ');
    return {
      letter: sectionInList[0],
      branch: sectionInList[1],
      year: sectionInList[2],
    };
  },

  /** SQL helper functions to convert
   * from database output format to more usable format */

  transformSqlRooms: (dbResult) => {
    const map = {};

    dbResult.forEach((row) => {
      if (!map[row.room_no]) map[row.room_no] = [];
      map[row.room_no].push(row.type);
    });

    const rooms = [];
    for (const [key, value] of Object.entries(map)) {
      value.toString = () => {
        return value.join(', ');
      };
      rooms.push({ roomNo: key, types: value.sort() });
    }

    return rooms;
  },

  transformSqlSubjects: (dbResult) => {
    return dbResult.map((row) => ({
      code: row.code,
      name: row.name,
      slotSize: row.slot_size,
      eventsCount: row.events_count,
    }));
  },

  sectionToString: (section) =>
    `Sec-${section.letter} ${section.branch} Year-${section.year}`,
  // eslint-disable-next-line object-shorthand
  transformSqlSections: function (sections, childSections) {
    // Map parent sections for each section
    sections.forEach((section) => {
      // Set id for tableGrid
      section.id = this.sectionToSectionId(
        section.letter,
        section.branch,
        section.year
      );

      section.parentSections = []; // New field to keep track of parent sections
      childSections.forEach((childSection) => {
        if (
          childSection.child_year === section.year &&
          childSection.child_branch === section.branch &&
          childSection.child_letter === section.letter
        ) {
          section.parentSections.push(this.sectionToString(childSection));
        }
      });
    });

    // Convert snake case to camel case and add a proper toString
    return sections.map((section) => {
      const newSection = {
        id: section.id,
        letter: section.letter,
        branch: section.branch,
        year: section.year,
        type: section.type,
        parentSections: section.parentSections,
      };
      newSection.toString = () =>
        `Sec-${newSection.letter} ${newSection.branch} Year-${newSection.year}`;
      return newSection;
    });
  },

  // eslint-disable-next-line func-names
  transformSqlEvents: function (
    events,
    eventRooms,
    eventRoomTypes,
    eventFaculties
  ) {
    // Get events with the requried fields first
    const resultEvents = events.map((event) => ({
      id: `${this.sectionToString({
        letter: event.section_letter,
        branch: event.section_branch,
        year: event.section_year,
      })},${event.subject_code}`,

      sectionYear: event.section_year,
      sectionBranch: event.section_branch,
      sectionLetter: event.section_letter,
      subjectCode: event.subject_code,
      rooms: [],
      roomTypes: [],
      faculties: [],
    }));

    const getMatchingEvent = (baseEvents, entity) =>
      baseEvents.find(
        (thisEvent) =>
          thisEvent.sectionYear === entity.section_year &&
          thisEvent.sectionBranch === entity.section_branch &&
          thisEvent.sectionLetter === entity.section_letter &&
          thisEvent.subjectCode === entity.subject_code
      );

    eventRooms.forEach((room) => {
      getMatchingEvent(resultEvents, room).rooms.push(room.room_no);
    });
    eventRoomTypes.forEach((roomType) => {
      getMatchingEvent(resultEvents, roomType).roomTypes.push(
        roomType.room_type
      );
    });
    eventFaculties.forEach((faculty) => {
      getMatchingEvent(resultEvents, faculty).faculties.push(
        faculty.faculty_code
      );
    });

    return resultEvents;
  },
};
