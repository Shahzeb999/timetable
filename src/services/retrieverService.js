/* eslint-disable no-console */
import { utilityFunctions } from '../utils/utilityFunctions';

class RetrieverService {
  constructor(dao) {
    this.dao = dao;
  }

  async getFacultyByCode(code) {
    console.info('Getting faculty by code', code);
    const result = await this.dao.get(`SELECT * FROM faculty WHERE code = ?`, [
      code,
    ]);
    console.info('Retrieved faculty with code', code, result);
    return result;
  }

  async getRoomByRoomNo(roomNo) {
    console.info('Getting Room for room no', roomNo);
    const result = await this.dao.get(
      `
      SELECT * FROM
      room NATURAL JOIN room_type
      WHERE room_no = ?
      `,
      [roomNo]
    );
    console.info('Retrieved Room by room no', roomNo, result);

    const room = { roomNo, types: [] };
    result.forEach((element) => {
      room.types.push(element.type);
    });
    console.info('After processing', room);
    return room;
  }

  async getDistinctRoomTypes() {
    console.info('Getting distinct room types');
    const result = await this.dao.all(`SELECT DISTINCT type FROM room_type`);
    console.info('Retrieved distinct room types');
    return result.map((obj) => obj.type);
  }

  async getAllRooms() {
    console.info('Getting all rooms');
    const result = await this.dao.all(
      `SELECT * FROM room NATURAL JOIN room_type`
    );
    console.info('Retrieved all rooms');
    return utilityFunctions.transformSqlRooms(result);
  }

  async getAllSubjects() {
    console.info('Getting all subjects');
    const result = await this.dao.all(`SELECT * FROM subject`);
    console.info('Retrieved all subjects');
    return utilityFunctions.transformSqlSubjects(result);
  }

  async getAllFaculties() {
    console.info('Getting all faculties');
    const result = await this.dao.all(`SELECT * FROM faculty`);
    console.info('Retrieved all faculties');
    return result;
  }

  async getAllSections() {
    console.info('Getting all sections');

    const sections = await this.dao.all(`SELECT * FROM section`);
    const childSections = await this.dao.all(`SELECT * FROM child_section`);

    console.info('Retrieved all sections');
    return utilityFunctions.transformSqlSections(sections, childSections);
  }

  async getAllEventsForSection(section) {
    console.info('Getting all events for section', section);

    const events = await this.dao.all(
      `
      SELECT * FROM event
      WHERE section_year = ? AND section_branch = ? AND section_letter = ?`,
      [section.year, section.branch, section.letter]
    );

    const eventRooms = await this.dao.all(
      `
      SELECT * FROM event_room
      WHERE section_year = ? AND section_branch = ? AND section_letter = ?`,
      [section.year, section.branch, section.letter]
    );

    const eventFaculties = await this.dao.all(
      `
      SELECT * FROM event_faculty
      WHERE section_year = ? AND section_branch = ? AND section_letter = ?`,
      [section.year, section.branch, section.letter]
    );

    const eventRoomTypes = await this.dao.all(
      `
      SELECT * FROM event_room_type
      WHERE section_year = ? AND section_branch = ? AND section_letter = ?`,
      [section.year, section.branch, section.letter]
    );

    console.info('Retrieved all events for secton');
    return utilityFunctions.transformSqlEvents(
      events,
      eventRooms,
      eventRoomTypes,
      eventFaculties
    );
  }

  async doesAnyEventExist() {
    const oneEvent = await this.dao.get('SELECT * FROM event');
    if (oneEvent) return true;
    return false;
  }

  async getAllBusySectionConstraints() {
    const result = await this.dao.all(
      `
      SELECT * FROM busy_section_constraint
      `
    );
    return result.map((res) => ({
      ...res,
      id: `${res.letter} ${res.branch} ${res.year} ${res.day} ${res.slot}`,
    }));
  }

  async getAllBusyFacultyConstraints() {
    const result = await this.dao.all(
      `
      SELECT * FROM busy_faculty_constraint
      `
    );
    return result.map((res) => ({
      ...res,
      id: `${res.code} ${res.day} ${res.slot}`,
    }));
  }

  async getValue(key) {
    const value = await this.dao.get(
      `
      SELECT * FROM json_key_value
      WHERE key = ?
    `,
      [key]
    );
    if (!value) return undefined;
    return value.value;
  }
}

export default RetrieverService;
