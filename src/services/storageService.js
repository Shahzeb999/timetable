/* eslint-disable no-console */
class StorageService {
  constructor(dao) {
    this.dao = dao;
  }

  async #createRoomTable() {
    const roomTableSql = `
      CREATE TABLE IF NOT EXISTS room (
        room_no TEXT PRIMARY KEY)`;
    await this.dao.run(roomTableSql);

    const roomTypeTableSql = `
      CREATE TABLE IF NOT EXISTS room_type (
        room_no TEXT NOT NULL,
        type TEXT NOT NULL,
        FOREIGN KEY(room_no) REFERENCES room(room_no) ON DELETE CASCADE
      )`;
    await this.dao.run(roomTypeTableSql);
  }

  async #createSubjectsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS subject (
        code TEXT NOT NULL PRIMARY KEY,
        name TEXT,
        slot_size INTEGER NOT NULL,
        events_count INTEGER NOT NULL
      )`;
    await this.dao.run(sql);
  }

  async #createFacultyTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS faculty (
        code TEXT NOT NULL PRIMARY KEY,
        name TEXT
      )`;
    await this.dao.run(sql);
  }

  async #createSectionTable() {
    const sectionTable = `
      CREATE TABLE IF NOT EXISTS section (
        year TEXT,
        branch TEXT,
        letter TEXT,
        type TEXT,
        PRIMARY KEY (year, branch, letter)
      )
    `;
    await this.dao.run(sectionTable);

    const childSection = `
      CREATE TABLE IF NOT EXISTS child_section (
        year TEXT,
        branch TEXT,
        letter TEXT,
        child_year TEXT,
        child_branch TEXT,
        child_letter TEXT,
        FOREIGN KEY(year, branch, letter) REFERENCES section(year, branch, letter)
          ON DELETE CASCADE,
        FOREIGN KEY(child_year, child_branch, child_letter) REFERENCES section(year, branch, letter)
          ON DELETE CASCADE
      )`;

    await this.dao.run(childSection);
  }

  async #createEventTable() {
    const eventTable = `
      CREATE TABLE IF NOT EXISTS event (
        section_year TEXT,
        section_branch TEXT,
        section_letter TEXT,
        subject_code TEXT,
        PRIMARY KEY (section_year, section_branch, section_letter, subject_code),
        FOREIGN KEY (section_year, section_branch, section_letter) REFERENCES section(year, branch, letter)
          ON DELETE CASCADE,
        FOREIGN KEY (subject_code) REFERENCES subject(code) ON DELETE CASCADE
      )`;
    await this.dao.run(eventTable);

    const eventRoomTable = `
      CREATE TABLE IF NOT EXISTS event_room (
        section_year TEXT,
        section_branch TEXT,
        section_letter TEXT,
        subject_code TEXT,
        room_no TEXT,
        FOREIGN KEY (section_year, section_branch, section_letter, subject_code)
          REFERENCES event(section_year, section_branch, section_letter, subject_code)
          ON DELETE CASCADE,
        FOREIGN KEY (room_no) REFERENCES room(room_no) ON DELETE CASCADE
      )`;
    await this.dao.run(eventRoomTable);

    const eventRoomTypeTable = `
      CREATE TABLE IF NOT EXISTS event_room_type (
        section_year TEXT,
        section_branch TEXT,
        section_letter TEXT,
        subject_code TEXT,
        room_type TEXT,
        FOREIGN KEY (section_year, section_branch, section_letter, subject_code)
          REFERENCES event(section_year, section_branch, section_letter, subject_code)
          ON DELETE CASCADE
          )`;
    // FOREIGN KEY (room_type) REFERENCES room(type) ON DELETE CASCADE
    await this.dao.run(eventRoomTypeTable);

    const eventFacultyTable = `
      CREATE TABLE IF NOT EXISTS event_faculty (
        section_year TEXT,
        section_branch TEXT,
        section_letter TEXT,
        subject_code TEXT,
        faculty_code TEXT,
        FOREIGN KEY (section_year, section_branch, section_letter, subject_code)
          REFERENCES event(section_year, section_branch, section_letter, subject_code)
          ON DELETE CASCADE,
        FOREIGN KEY (faculty_code) REFERENCES faculty(code)
          ON DELETE CASCADE
      )`;
    await this.dao.run(eventFacultyTable);
  }

  async #createjsonKeyValueTable() {
    const jsonKeyValueTable = `
      CREATE TABLE IF NOT EXISTS json_key_value (
        key TEXT,
        value TEXT
      )`;
    await this.dao.run(jsonKeyValueTable);
  }

  async #createBusySectionConstraintTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS busy_section_constraint (
        letter TEXT,
        branch TEXT,
        year TEXT,
        day INTEGER,
        slot INTEGER,
        FOREIGN KEY (letter, branch, year)
          REFERENCES section(letter, branch, year)
          ON DELETE CASCADE
      )`;
    await this.dao.run(sql);
  }

  async #createBusyFacultyConstraintTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS busy_faculty_constraint (
        code TEXT,
        day INTEGER,
        slot INTEGER
      )`;
    await this.dao.run(sql);
  }

  async createAllTables() {
    // Database configurations
    // To allow cascade on delete
    await this.dao.run(`PRAGMA foreign_keys = ON`);

    console.info('Creating tables');

    await this.#createRoomTable();
    await this.#createSubjectsTable();
    await this.#createFacultyTable();
    await this.#createSectionTable();
    await this.#createEventTable();
    await this.#createjsonKeyValueTable();
    await this.#createBusySectionConstraintTable();
    await this.#createBusyFacultyConstraintTable();

    console.info('Created tables');
  }

  /**
   * Saves a room in to the database.
   * Room.roomNo is the room number. It msut be not null and unique.
   * Room.types is a list of all the room types for this room.
   * @param {room} object An object defining a particular room
   */
  async saveRoom(room) {
    console.info('Saving room', room);

    // Save room
    await this.dao.run('INSERT INTO room (room_no) VALUES (?)', [room.roomNo]);

    // Save all room types
    const results = [];
    room.types.forEach(async (type) => {
      results.push(
        this.dao.run('INSERT INTO room_type (room_no, type) VALUES (?, ?)', [
          room.roomNo,
          type,
        ])
      );
    });

    await Promise.all(results);
    console.info('Saved room');
  }

  async deleteRoom(roomNo) {
    console.info('Deleting room', roomNo);
    const sql = `
      DELETE FROM room
      WHERE room_no = ?
      `;
    const result = await this.dao.run(sql, [roomNo]);

    console.info('Delete query executed with result', result);
  }

  async saveSubject(subject) {
    console.info('Saving subject', subject);
    const sql = `
      INSERT INTO subject
      (code, name, slot_size, events_count)
      VALUES (?, ?, ?, ?)
      `;
    await this.dao.run(sql, [
      subject.code,
      subject.name,
      subject.slotSize,
      subject.eventsCount,
    ]);

    console.info('Saved subject');
  }

  async deleteSubject(code) {
    console.info('Deleting subject', code);
    const sql = `
      DELETE FROM subject
      WHERE code = ?
      `;
    await this.dao.run(sql, [code]);

    console.info('Deleted subject');
  }

  async saveFaculty(faculty) {
    console.info('Saving faculty', faculty);
    const sql = `
      INSERT INTO faculty
      (code, name)
      VALUES (?, ?)`;
    await this.dao.run(sql, [faculty.code, faculty.name]);

    console.info('Saved faculty');
  }

  async deleteFaculty(code) {
    console.info(`Deleting faculty`, code);
    const sql = `
      DELETE FROM faculty
      WHERE code = ?`;
    await this.dao.run(sql, [code]);

    console.info('Deleted faculty');
  }

  async saveSection(section) {
    console.log('Saving section', section);

    // Save base section
    const sql = `
      INSERT INTO section
      (year, branch, letter, type)
      VALUES (?, ?, ?, ?)
      `;
    await this.dao.run(sql, [
      section.year,
      section.branch,
      section.letter,
      section.type,
    ]);

    // Save child sections if available
    const allPromises = [];
    section.parentSections.forEach((parentSection) => {
      const sql2 = `
        INSERT INTO child_section
        (year, branch, letter, child_year, child_branch, child_letter)
        VALUES (?, ?, ?, ?, ?, ?)`;
      allPromises.push(
        this.dao.run(sql2, [
          parentSection.year,
          parentSection.branch,
          parentSection.letter,
          section.year,
          section.branch,
          section.letter,
        ])
      );
    });
    await Promise.all(allPromises);
    console.log('Inserted section');
  }

  async deleteSection(section) {
    console.info('Deleting section', section);
    const sql = `
      DELETE FROM section
      WHERE year = ? AND branch = ? AND letter = ?
    `;
    await this.dao.run(sql, [section.year, section.branch, section.letter]);
    console.info('Deleted section');
  }

  async saveEvent(event) {
    console.info('Saving event', event);
    // Save event
    await this.dao.run(
      `
      INSERT INTO event (section_year, section_branch, section_letter, subject_code)
      VALUES (?, ?, ?, ?)`,
      [
        event.sectionYear,
        event.sectionBranch,
        event.sectionLetter,
        event.subjectCode,
      ]
    );

    const promises = [];
    // Save event rooms
    event.rooms.forEach((room) => {
      promises.push(
        this.dao.run(
          `
        INSERT INTO event_room (section_year, section_branch, section_letter, subject_code, room_no)
        VALUES (?, ?, ?, ?, ?)`,
          [
            event.sectionYear,
            event.sectionBranch,
            event.sectionLetter,
            event.subjectCode,
            room,
          ]
        )
      );
    });

    // save event room types
    event.roomTypes.forEach((roomType) => {
      promises.push(
        this.dao.run(
          `
        INSERT INTO event_room_type (section_year, section_branch, section_letter, subject_code, room_type)
        VALUES (?, ?, ?, ?, ?)`,
          [
            event.sectionYear,
            event.sectionBranch,
            event.sectionLetter,
            event.subjectCode,
            roomType,
          ]
        )
      );
    });

    // save event faculties
    event.faculties.forEach((faculty) => {
      promises.push(
        this.dao.run(
          `
        INSERT INTO event_faculty (section_year, section_branch, section_letter, subject_code, faculty_code)
        VALUES (?, ?, ?, ?, ?)`,
          [
            event.sectionYear,
            event.sectionBranch,
            event.sectionLetter,
            event.subjectCode,
            faculty,
          ]
        )
      );
    });

    await Promise.all(promises);
  }

  async deleteEvent(event) {
    await this.dao.run(
      `
      DELETE FROM event
      WHERE section_year = ? AND section_branch = ? AND section_letter = ? AND subject_code = ?`,
      [
        event.sectionYear,
        event.sectionBranch,
        event.sectionLetter,
        event.subjectCode,
      ]
    );
  }

  async saveBusySectionConstraints(sections, timeSlots) {
    const promises = [];

    sections.forEach((section) => {
      timeSlots.forEach((timeSlot) => {
        const sql = `
          INSERT INTO busy_section_constraint
          (letter, branch, year, day, slot)
          VALUES (?, ?, ?, ?, ?)
        `;

        promises.push(
          this.dao.run(sql, [
            section.letter,
            section.branch,
            section.year,
            timeSlot[0],
            timeSlot[1],
          ])
        );
      });
    });
    await Promise.all(promises);
  }

  async deleteBusySectionConstraint(section, timeSlot) {
    await this.dao.run(
      `
      DELETE FROM busy_section_constraint
      WHERE letter = ? AND branch = ? AND year = ? AND day = ? AND slot = ?
      `,
      [section.letter, section.branch, section.year, timeSlot[0], timeSlot[1]]
    );
  }

  async saveBusyFacultyConstraint(facultyCodes, timeSlots) {
    const promises = [];

    facultyCodes.forEach((facultyCode) => {
      timeSlots.forEach((timeSlot) => {
        promises.push(
          this.dao.run(
            `
          INSERT INTO busy_faculty_constraint
          (code, day, slot)
          VALUES (?, ?, ?)
        `,
            [facultyCode, timeSlot[0], timeSlot[1]]
          )
        );
      });
    });
    await Promise.all(promises);
  }

  async deleteBusyFacultyConstraint(facultyCode, timeSlot) {
    await this.dao.run(
      `
      DELETE FROM busy_faculty_constraint
      WHERE code = ? AND day = ? AND slot = ?
      `,
      [facultyCode, timeSlot[0], timeSlot[1]]
    );
  }

  async saveKeyValue(key, value) {
    await this.dao.run(
      `
      DELETE FROM json_key_value
      WHERE key = ?
    `,
      [key]
    );

    await this.dao.run(
      `
      INSERT INTO json_key_value
      (key, value)
      VALUES (?, ?)
    `,
      [key, value]
    );
  }
}

export default StorageService;
