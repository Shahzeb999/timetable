/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import { ENGINE_FILE_PATH, JSON_DIRECTORY } from '../utils/constants';
import { utilityFunctions } from '../utils/utilityFunctions';

const path = require('path');
const fs = require('fs');
const awaitSpawn = require('await-spawn');

/** This class provides a bridge between this UI application
 * and the engine that runs the algorithm to solve the timetabling problem.
 * This class handles-
 *  Transformation of data from database to engine compatible JSON file
 *  Call the external engine service
 *  Decode the response from the external service and save it into the database
 */
export default class EngineBridgeService {
  /**
   * Initializes the object variables and makes JSON file
   * directories for problem and solution if they don't exist
   * @param {RetrieverService} retrieverService
   * @param {StorageService} storageService
   */
  constructor(retrieverService, storageService) {
    this.retrieverService = retrieverService;
    this.storageService = storageService;

    this.jsonData = {
      resources: [],
      resourceGroups: [],
      conflictingResources: [],
      events: [],
      days: 0,
      slotsPerDay: 0,
      resourceBusy: [],
      noResourceAvailable: [],
    };

    this.resourceCounter = 1;
    this.resourceGroupCounter = 1;
    this.eventsCounter = 1;

    this.facultyToIdMap = {};
    this.roomToIdMap = {};
    this.sectionToIdMap = {};
    this.roomTypeToResourceGroupIdMap = {};

    this.idToResourceMap = {};
    this.eventIdToSubjectMap = {};

    this.allSections = [];

    this.problemPath = path.resolve(JSON_DIRECTORY, 'problem.json');
    this.solutionPath = path.resolve(JSON_DIRECTORY, 'solution.json');
    if (!fs.existsSync(JSON_DIRECTORY)) {
      fs.mkdirSync(JSON_DIRECTORY);
    }

    this.jsonSolution = null;

    /* This will store Resource names and other usefull information rather than
      resource IDs */
    this.decodedJsonSolution = [];

    /** Stores the encoded events that have at least one unassigned resource */
    this.incompleteEvents = [];

    this.forceGenerate = false;
  }

  /**
   * Checks if the input data is good to generate timetable
   * @returns Object {validated: boolean, message: string}
   */
  async #validateInputData() {
    const result = { validated: false, message: '' };

    const doesAnyEventExist = await this.retrieverService.doesAnyEventExist();

    if (!doesAnyEventExist) {
      result.message = 'Please add events before generating timetable';
      return result;
    }

    // check that other information is present
    const otherInformation = {
      days: 'Days',
      slotsPerDay: 'Slots Per Day',
      lunchSlot: 'Lunch Slot',
    };
    // eslint-disable-next-line no-restricted-syntax
    for (const otherInformationKey of Object.keys(otherInformation)) {
      // eslint-disable-next-line no-await-in-loop
      if (!(await this.retrieverService.getValue(otherInformationKey))) {
        result.message = `Please enter the value of ${otherInformation[otherInformationKey]} from the other information tab and click save`;
        return result;
      }
    }

    // Check that resource busy constraints are within given other information range
    const days = parseInt(await this.retrieverService.getValue('days'), 10);
    const slots = parseInt(
      await this.retrieverService.getValue('slotsPerDay'),
      10
    );

    const busySectionConstraints =
      await this.retrieverService.getAllBusySectionConstraints();
    for (const constraint of busySectionConstraints) {
      if (
        parseInt(constraint.day, 10) > days ||
        parseInt(constraint.slot, 10) > slots
      ) {
        result.message = 'Some invalid Busy Section Constraint is present';
        return result;
        // for each is not gonna work dumbass
      }
    }

    const busyFacultyConstraint =
      await this.retrieverService.getAllBusyFacultyConstraints();
    for (const constraint of busyFacultyConstraint) {
      if (
        parseInt(constraint.day, 10) > days ||
        parseInt(constraint.slot, 10) > slots
      ) {
        result.message = 'Some invalid Busy Faculty Constraint is present';
        return result;
      }
    }

    result.validated = true;
    return result;
  }

  /**
   * Reads faculties information from database
   * and loads into jsonData and saves other information about it
   */
  async #processFaculties() {
    const allFaculties = await this.retrieverService.getAllFaculties();
    allFaculties.forEach((faculty) => {
      this.jsonData.resources.push(this.resourceCounter);
      this.facultyToIdMap[faculty.code] = this.resourceCounter;
      this.idToResourceMap[this.resourceCounter] = {
        type: 'faculty',
        name: faculty.code,
      };
      this.resourceCounter += 1;
    });
  }

  async #processRoomsAndRoomTypes() {
    const allRooms = await this.retrieverService.getAllRooms();
    const allRoomTypes = await this.retrieverService.getDistinctRoomTypes();

    // Store resource groups that is, room types
    allRoomTypes.forEach((roomType) => {
      this.jsonData.resourceGroups.push({
        id: this.resourceGroupCounter,
        resourceIds: [],
      });
      this.roomTypeToResourceGroupIdMap[roomType] = this.resourceGroupCounter;
      this.resourceGroupCounter += 1;
    });

    // Process Rooms
    allRooms.forEach((room) => {
      this.jsonData.resources.push(this.resourceCounter);
      this.roomToIdMap[room.roomNo] = this.resourceCounter;
      this.idToResourceMap[this.resourceCounter] = {
        type: 'room',
        name: room.roomNo,
      };

      // Store room types of this room in appropriate resource groups
      room.types.forEach((type) => {
        this.jsonData.resourceGroups
          .find(
            (resourceGroup) =>
              this.roomTypeToResourceGroupIdMap[type] === resourceGroup.id
          )
          .resourceIds.push(this.resourceCounter);
      });

      this.resourceCounter += 1;
    });
  }

  /** Set conflicting resources from parent sections */
  async #processParentSections(allSections) {
    const conflictingSections = {};
    // Process base sections
    allSections
      .filter((section) => section.type === 'base')
      .forEach((baseSection) => {
        conflictingSections[utilityFunctions.sectionToString(baseSection)] = [];
      });
    // batch sections
    allSections
      .filter((section) => section.type === 'batch')
      .forEach((batchSection) => {
        batchSection.parentSections.forEach((parentSectionString) => {
          conflictingSections[parentSectionString].push(
            batchSection.toString()
          );
        });
      });

    // Elective sections
    allSections
      .filter((section) => section.type === 'elective')
      .forEach((electiveSection) => {
        conflictingSections[electiveSection] = [];
        electiveSection.parentSections.forEach((parentSection) => {
          conflictingSections[electiveSection] = [
            ...conflictingSections[electiveSection],
            ...conflictingSections[parentSection],
            parentSection,
          ];
        });
      });

    // Elective batch sections
    allSections
      .filter((section) => section.type === 'elective batch')
      .forEach((electiveBatchSection) => {
        electiveBatchSection.parentSections.forEach((parentSectionString) => {
          conflictingSections[electiveBatchSection] = [
            ...conflictingSections[parentSectionString],
            parentSectionString,
          ];
        });
      });

    // Set conflicting resources from conflicting sections
    Object.keys(conflictingSections).forEach((section) => {
      const id1 = this.sectionToIdMap[section];
      conflictingSections[section].forEach((conflictingSection) => {
        const id2 = this.sectionToIdMap[conflictingSection];
        this.jsonData.conflictingResources.push([id1, id2]);
      });
    });
  }

  async #processSections() {
    this.allSections = await this.retrieverService.getAllSections();

    this.allSections.forEach((section) => {
      this.jsonData.resources.push(this.resourceCounter);
      this.sectionToIdMap[section.toString()] = this.resourceCounter;
      this.idToResourceMap[this.resourceCounter] = {
        type: 'section',
        name: section.toString(),
      };
      this.resourceCounter += 1;
    });

    await this.#processParentSections(this.allSections);
  }

  async #processEvents() {
    const allSubjects = await this.retrieverService.getAllSubjects();

    // Iterate over all events
    for (let i = 0; i < this.allSections.length; i += 1) {
      const section = this.allSections[i];
      // eslint-disable-next-line no-await-in-loop
      const allEventsForSection =
        await this.retrieverService.getAllEventsForSection(section);
      allEventsForSection.forEach((event) => {
        const eventSubject = allSubjects.find(
          (subject) => subject.code === event.subjectCode
        );

        const [slotSize, eventsCount] = [
          eventSubject.slotSize,
          eventSubject.eventsCount,
        ];
        const roomIds = event.rooms.map((roomNo) => this.roomToIdMap[roomNo]);
        const roomTypeIds = event.roomTypes.map(
          (roomType) => this.roomTypeToResourceGroupIdMap[roomType]
        );
        const facultyIds = event.faculties.map(
          (faculty) => this.facultyToIdMap[faculty]
        );
        const sectionId = this.sectionToIdMap[section.toString()];

        for (let count = 0; count < eventsCount; count += 1) {
          this.jsonData.events.push({
            id: this.eventsCounter,
            slotSize,
            preassignedResourceIds: [...roomIds, ...facultyIds, sectionId],
            unassignedResourceGroupIds: [...roomTypeIds],
          });

          this.eventIdToSubjectMap[this.eventsCounter] = eventSubject.code;

          this.eventsCounter += 1;
        }
      });
    }
  }

  async #processOtherInformation() {
    const days = await this.retrieverService.getValue('days');

    this.jsonData.days = parseInt(days, 10);
    const slotsPerDay = await this.retrieverService.getValue('slotsPerDay');
    this.jsonData.slotsPerDay = parseInt(slotsPerDay, 10);

    const lunchSlot = parseInt(
      await this.retrieverService.getValue('lunchSlot'),
      10
    );
    if (lunchSlot !== 0) {
      const lunchSlotSize = parseInt(
        await this.retrieverService.getValue('lunchSlotSize'),
        10
      );
      const noResourceAvailableObject = {
        days: [],
        timeSlots: [],
      };
      for (let slot = lunchSlot; slot < lunchSlot + lunchSlotSize; slot += 1) {
        noResourceAvailableObject.timeSlots.push(slot);
      }
      for (let i = 1; i <= this.jsonData.days; i += 1) {
        noResourceAvailableObject.days.push(i);
      }

      this.jsonData.noResourceAvailable.push(noResourceAvailableObject);
    }
  }

  async #processBusyResourceConstraints() {
    const busySectionConstraints =
      await this.retrieverService.getAllBusySectionConstraints();
    const busyFacultyConstraint =
      await this.retrieverService.getAllBusyFacultyConstraints();

    busySectionConstraints.forEach((constraint) => {
      this.jsonData.resourceBusy.push({
        resourceId:
          this.sectionToIdMap[
            utilityFunctions.sectionToString({
              letter: constraint.letter,
              branch: constraint.branch,
              year: constraint.year,
            })
          ],
        days: [constraint.day],
        timeSlots: [constraint.slot],
      });
    });

    busyFacultyConstraint.forEach((constraint) => {
      this.jsonData.resourceBusy.push({
        resourceId: this.facultyToIdMap[constraint.code],
        days: [constraint.day],
        timeSlots: [constraint.slot],
      });
    });
  }

  async #getTimetablingProblemInJson() {
    /* Process Resources */
    await this.#processFaculties();
    await this.#processRoomsAndRoomTypes();
    await this.#processSections();

    /* Process Events */
    await this.#processEvents();

    /* Process other information */
    await this.#processOtherInformation();

    /* Process busy resource constraints */
    await this.#processBusyResourceConstraints();
  }

  #writeJsonToFile() {
    try {
      fs.writeFileSync(
        this.problemPath,
        JSON.stringify(this.jsonData, null, 4)
      );
      fs.writeFileSync(this.solutionPath, JSON.stringify({}));
    } catch (err) {
      console.error(err);
      throw Error(`Error while giving json problem to Engine${err.message}`);
    }
  }

  async #callEngineToGenerateSolution() {
    console.info('Problem path: ', this.problemPath);
    console.info('Engine path', ENGINE_FILE_PATH);

    console.info('Spawning child process');

    try {
      const child = await awaitSpawn(ENGINE_FILE_PATH, [
        `-i`,
        this.problemPath,
        '-o',
        this.solutionPath,
      ]);
      console.info('stdout: ', child.toString());
    } catch (err) {
      console.error('Error given by Engine', err.code);
      if (parseInt(err.code, 10) === 801) {
        throw Error(
          `Error Occurred! Please check if there are enough resources to be assigned.
          There is likely some event where its impossible to assign all the required resources`
        );
      }
      console.error('error: ', err.stderr.toString());
      throw Error(`Error while generating timetable: ${err.stderr.toString()}`);
    }

    // const child = require('child_process').execFile(
    //   ENGINE_FILE_PATH,
    //   ['-i', this.problemPath, '-o', this.solutionPath],
    //   function (err, stdout, stderr) {
    //     // Node.js will invoke this callback when process terminates.
    //     console.log('DONEEEEE');
    //   }
    // );
    // child.stdout.on('data', function (data) {
    //   console.log(data.toString());
    // });
  }

  /**
   * Reads the generated solution from disk
   */
  #readJsonSolution() {
    try {
      const data = fs.readFileSync(this.solutionPath, 'utf-8');
      this.jsonSolution = JSON.parse(data.toString());
    } catch (err) {
      console.error(err);
      throw Error(
        `Error while reading solution generated from Engine: ${err.message}`
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  #getSectionLetter(sectionName) {
    return utilityFunctions.sectionStringToSection(sectionName).letter;
  }

  #getSectionType(sectionName) {
    const section = utilityFunctions.sectionStringToSection(sectionName);
    return this.allSections.find(
      (sectionObject) =>
        sectionObject.letter === section.letter &&
        sectionObject.branch === section.branch &&
        sectionObject.year === section.year
    ).type;
  }

  /**
   * Parses jsonSolution into the decodedJsonSolution
   * What needs to be done?
   * Copy slotSize and assignedSlot as it is
   * For preAssignedResourceIds, insert resource Name and resource type
   * For assignedResourceIds (each element is an array of two elements [resourceId, resourceGroupId]),
   *    insert resource Name and resource type
   * For the section resource, insert it into a separate section field
   */
  #decodeJsonSolution() {
    this.jsonSolution.forEach((event) => {
      const subject = this.eventIdToSubjectMap[event.id];
      let section;
      let sectionLetter;
      let sectionType;
      const rooms = [];
      const faculties = [];

      // Do the union of preassignedResourceIds and assignedResourceIds's resource id
      // leaving behind resource group id
      const allResourceIds = [
        ...event.preassignedResourceIds,
        ...event.assignedResourceIds.map(
          (assignedResource) => assignedResource[0]
        ),
      ];
      allResourceIds.forEach((resourceId) => {
        const resource = this.idToResourceMap[resourceId];
        switch (resource.type) {
          case 'section':
            section = resource.name;
            sectionLetter = this.#getSectionLetter(resource.name);
            sectionType = this.#getSectionType(resource.name);
            break;
          case 'room':
            rooms.push(resource.name);
            break;
          case 'faculty':
            faculties.push(resource.name);
            break;
          default:
            console.error('Code phatt gaya mera or kisi ko pata bhi ni chala');
        }
      });

      // const [assignedDay, assignedSlot] = event.assignedTimeSlot;
      // if (assigne)
      const decodedEvent = {
        subject,
        section,
        sectionLetter,
        sectionType,
        rooms,
        faculties,
        assignedTimeSlot: event.assignedTimeSlot,
        slotSize: event.slotSize,
      };

      if (
        event.assignedTimeSlot[1] === 0 ||
        event.assignedTimeSlot[1] > this.jsonData.slotsPerDay
      ) {
        console.warn('BAAAD Event', decodedEvent);
      }

      if (
        event.unassignedResourceGroupIds.length !== 0 ||
        event.assignedTimeSlot[1] === 0
      )
        this.incompleteEvents.push(decodedEvent);
      else
        this.decodedJsonSolution.push({
          subject,
          section,
          sectionLetter,
          sectionType,
          rooms,
          faculties,
          assignedTimeSlot: event.assignedTimeSlot,
          slotSize: event.slotSize,
        });
    });
  }

  async #saveJsonSolutionInDatabase(jsonSolution) {
    await this.storageService.saveKeyValue(
      'solution',
      JSON.stringify(jsonSolution)
    );
  }

  async generateTimetable(
    setStatusMessageAndType,
    setAlreadyGenerated,
    forceOverwrite
  ) {
    /* Validate Input Data */
    const validationResult = await this.#validateInputData();
    if (!validationResult.validated) {
      setStatusMessageAndType(validationResult.message, 'warning');
      return;
    }

    /* Check if a timetable is already generated */
    if (!forceOverwrite && (await this.retrieverService.getValue('solution'))) {
      setStatusMessageAndType('A timetable is already generated', 'warning');
      setAlreadyGenerated(true);
      return;
    }

    /* Process input data to produce json timetabling problem */
    setStatusMessageAndType('Processing Data', 'info');
    await this.#getTimetablingProblemInJson();

    /* Write json object to file */
    setStatusMessageAndType('Sending data to engine', 'info');
    this.#writeJsonToFile();
    console.info('JSON Timetabling Problem: ', this.jsonData);

    /* Call the engine to generate timetable */
    const startTime = new Date().getTime();
    setStatusMessageAndType('Solving the timetabling problem', 'info');
    try {
      await this.#callEngineToGenerateSolution();
    } catch (err) {
      setStatusMessageAndType(err.message, 'error');
      return;
    }
    const endTime = new Date().getTime();
    const timeTaken = new Date(endTime - startTime).toISOString().slice(11, 19);

    /* Read the generated solution */
    console.info('Reading JSON solution from file', 'info');
    this.#readJsonSolution();
    console.info(this.jsonSolution);

    /* Decode the generated solution */
    setStatusMessageAndType('Processing solution', 'info');
    this.#decodeJsonSolution();
    console.info('Decoded solution: ', this.decodedJsonSolution);

    /* If any incomplete events then just log them and ignore the shit out of them */
    if (this.incompleteEvents.length > 0)
      console.warn('INCOMPLETE EVENTS COUNT = ', this.incompleteEvents.length);
    console.warn('INCOMPLETE EVENTS: ', this.incompleteEvents);

    /* Save the solution in database */
    setStatusMessageAndType('Saving solution', 'info');
    await this.#saveJsonSolutionInDatabase(this.decodedJsonSolution);

    /* Finish after providing the good news */
    const incompleteEventsStrings = [];
    this.incompleteEvents.forEach((incompleteEvent) => {
      incompleteEventsStrings.push(
        `${incompleteEvent.section}, ${incompleteEvent.subject}`
      );
    });
    let incompleteEventsString = '';
    if (incompleteEventsStrings.length > 0) {
      incompleteEventsString = `( ${incompleteEventsStrings.join(' | ')} ) `;
    }
    setStatusMessageAndType(
      `Successfully generated timetable with ${this.incompleteEvents.length} incomplete events. \n${incompleteEventsString}` +
        `\nPlease check the view timetable tab` +
        `\nTime taken: ${timeTaken}s`,
      'success'
    );
  }

  #debugPrintConflictingResources() {
    console.info('------------------ CONFLICTING RESOURCES ------------------');
    console.info('map: ', this.sectionToIdMap);
    this.jsonData.conflictingResources.forEach((conflictingResource) => {
      const [id1, id2] = conflictingResource;
      console.info(id1, id2);
      const name1 = Object.keys(this.sectionToIdMap).find(
        (key) => this.sectionToIdMap[key] === id1
      );
      const name2 = Object.keys(this.sectionToIdMap).find(
        (key) => this.sectionToIdMap[key] === id2
      );
      console.info(name1, name2);
    });
  }
}
