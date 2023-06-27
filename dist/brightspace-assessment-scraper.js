var BrightspaceAssessmentScraper = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    default: () => BrightspaceRubricScraper
  });

  // src/api.js
  function BrightspaceApi(brightspaceBase, brightspaceApiBase) {
    const brightspaceApi = {
      assessmentList: (organizationId) => new URL(`/d2l/api/le/1.8/${organizationId}/dropbox/folders/`, brightspaceApiBase).toString(),
      classList: (organizationId) => new URL(`/d2l/api/le/1.8/${organizationId}/classlist/`, brightspaceBase).toString(),
      sectionList: (organizationId) => new URL(`/d2l/api/lp/1.8/${organizationId}/sections/`, brightspaceApiBase).toString(),
      authToken: () => new URL(`/d2l/lp/auth/oauth2/token`, brightspaceBase).toString(),
      referrer: (organizationId) => new URL("/d2l/ap/insights/classEngagement/View?ou=" + organizationId, brightspaceBase).toString(),
      rubricsCriteria: (organizationId, rubricId) => new URL(`/organizations/${organizationId}/${rubricId}/groups`, brightspaceApiBase).toString(),
      rubricsScore: () => new URL("/d2l/lms/competencies/rubric/rubrics_assessment_results.d2l", brightspaceBase),
      gradesExport: (organizationId) => new URL(
        `/d2l/lms/grades/admin/importexport/export/options_edit.d2l?ou=${organizationId}`,
        brightspaceBase
      ).toString()
    };
    async function getClassList(organizationId) {
      const response = await fetch(brightspaceApi.classList(organizationId));
      return response.json();
    }
    async function getSectionList(organizationId, jwt) {
      const response = await fetch(brightspaceApi.sectionList(organizationId), {
        headers: { authorization: `Bearer ${jwt}` }
      });
      return response.json();
    }
    async function getAccessToken(orgId) {
      const xsrfToken = localStorage.getItem("XSRF.Token");
      const response = await fetch(brightspaceApi.authToken(), {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
          "content-type": "application/x-www-form-urlencoded",
          "sec-ch-ua": '" Not;A Brand";v="99", "Microsoft Edge";v="103", "Chromium";v="103"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-csrf-token": xsrfToken
        },
        referrer: brightspaceApi.referrer(),
        referrerPolicy: "strict-origin-when-cross-origin",
        body: "scope=*%3A*%3A*",
        method: "POST",
        mode: "cors",
        credentials: "include"
      });
      const data = await response.json();
      return data.access_token;
    }
    async function getRubricCriteria(organizationId, rubricId, jwt) {
      const response = await fetch(brightspaceApi.rubricsCriteria(organizationId, rubricId), {
        headers: { authorization: `Bearer ${jwt}` }
      });
      const data = await response.json();
      const links = data.entities.map((entity) => entity.links[0].href);
      return Promise.all(
        links.map(
          (url) => fetch(url, { headers: { authorization: `Bearer ${jwt}` } }).then((response2) => response2.json())
        )
      );
    }
    async function getStudentRubricScore(orgId, evalObjectId, rubricId, studentId, jwt) {
      const url = brightspaceApi.rubricsScore();
      const params = {
        ou: orgId,
        evalObjectId,
        userId: studentId,
        rubricId,
        evalObjectType: "1",
        groupId: "0",
        d2l_body_type: "5",
        closeButton: "1",
        showRubricHeadings: "0"
      };
      Object.entries(params).forEach(([name, value]) => url.searchParams.append(name, value));
      const response = await fetch(url);
      const studentRubricsHtml = await response.text();
      const matches = studentRubricsHtml.match(/assessment-href="(.*?)"/);
      if (!matches)
        throw new Error("No matches");
      const studentRubricCriteriaUrl = matches[1];
      const studentRubricCriteriaResponse = await fetch(studentRubricCriteriaUrl, {
        headers: { authorization: `Bearer ${jwt}` }
      });
      const studentRubricCriteriaData = await studentRubricCriteriaResponse.json();
      const studentRubricCriteriaAssessmentLinks = studentRubricCriteriaData.entities.filter((entity) => entity.class[0] === "criterion-assessment-links").map((entity) => entity.links[2].href);
      return await Promise.all(
        studentRubricCriteriaAssessmentLinks.map(async (link) => {
          const response2 = await fetch(link, { headers: { authorization: `Bearer ${jwt}` } });
          return response2.json();
        })
      );
    }
    function getAssessmentList(organizationId) {
      return getAccessToken(organizationId).then(
        (jwt) => fetch(brightspaceApi.assessmentList(organizationId), {
          headers: { authorization: `Bearer ${jwt}` }
        })
      ).then((response) => response.json());
    }
    return {
      getAssessmentList,
      getClassList,
      getSectionList,
      getAccessToken,
      getRubricCriteria,
      getStudentRubricScore
    };
  }

  // src/defaults.js
  var DEFAULTS = {
    SAS_CSV_CLASS_COLUMN_NAME: "MODULE_CODE",
    SAS_CSV_GRADES_COLUMN_NAME: "Grades",
    GRADES: ["A", "B+", "B", "C+", "C", "D+", "D", "D-", "F"],
    ROLES: {
      LECTURER: 212,
      STUDENT: 214,
      LEARNER: 209
    }
  };
  var defaults_default = DEFAULTS;

  // src/data-formatter.js
  function getDateTimeGenerated() {
    return (/* @__PURE__ */ new Date()).toLocaleString().replace(", ", "T");
  }
  function calculateGrade(score) {
    const start = 80;
    const step = 5;
    const grades = ["A", "B+", "B", "C+", "C", "D+", "D", "D-"];
    const cutOffPoint = grades.map((_, idx) => start - idx * step);
    for (let i = 0; i < cutOffPoint.length; i++) {
      if (score >= cutOffPoint[i]) {
        return grades[i];
      }
    }
    return "F";
  }
  function downloadCsv(rows, options = { outputFilename: "", delimiter: "," }) {
    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach(function(rowArray) {
      let row = rowArray.join(options.delimiter);
      csvContent += row + "\r\n";
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    let outputFilename = options.outputFilename;
    if (!outputFilename) {
      outputFilename = `brightspace_rubric_${Math.floor(+/* @__PURE__ */ new Date() / 1e3)}.csv`;
    }
    link.setAttribute("download", outputFilename);
    document.body.appendChild(link);
    link.click();
  }
  function generateCheckingVerifyingCsv(criteria, studentResult, title, dateTimeGenerated = getDateTimeGenerated()) {
    const csv = [["AYXX/XX", "", "Semester X", "", title, "", "Weightage:", "???"], [], [], [], []];
    const criteriaMax = [
      dateTimeGenerated,
      "",
      "",
      "Max",
      ...criteria.map(({ max }) => max),
      // max of each criteria
      criteria.reduce((total, { max }) => total + max, 0)
      // max total
    ];
    const criteriaNames = [
      "Student Id",
      "Name",
      "IChat",
      "Class",
      ...criteria.map(({ name }) => name),
      "Total",
      "Grade"
    ];
    const sections = /* @__PURE__ */ new Set();
    const sectionsMap = {};
    studentResult.forEach((result) => {
      const { student } = result;
      const studentId = student["OrgDefinedId"].substring(3);
      const studentName = student["FirstName"];
      const ichatEmail = student["Username"];
      const studentClass = student["Section"];
      const row = [studentId, studentName, ichatEmail, studentClass];
      criteria.forEach((criterion) => {
        const { criteriaId } = criterion;
        const score = result.total ? result[criteriaId] || 0 : "AB";
        row.push(score);
      });
      row.push(result.total || "AB");
      row.push(calculateGrade(result.total || 0));
      sections.add(studentClass);
      if (!sectionsMap[studentClass])
        sectionsMap[studentClass] = [];
      sectionsMap[studentClass].push(row);
    });
    const sectionsArray = [...sections];
    sectionsArray.sort().forEach((section) => {
      csv.push([]);
      csv.push([]);
      csv.push([]);
      csv.push([]);
      const sectionRows = sectionsMap[section].sort();
      csv.push(criteriaMax);
      csv.push(criteriaNames);
      sectionRows.forEach((row) => csv.push(row));
      csv.push(["Marked by:", "", "date:", "", "Sign:"]);
      csv.push(["Checked by:", "", "date:", "", "Sign:"]);
    });
    downloadCsv(csv, {
      outputFilename: `brightspace_rubric_${title}_marksheet_${dateTimeGenerated}.csv`
    });
  }
  function generateSasCsvData(studentResult, title) {
    const csv = [
      [defaults_default.SAS_CSV_CLASS_COLUMN_NAME, "Name", "Student Id", title, defaults_default.SAS_CSV_GRADES_COLUMN_NAME]
    ];
    csv.push(
      ...studentResult.sort(
        ({ student: { Section: s1, OrgDefinedId: id1 } }, { student: { Section: s2, OrgDefinedId: id2 } }) => {
          const classSort = s1.localeCompare(s2);
          if (classSort === 0) {
            return id1.localeCompare(id2);
          }
          return classSort;
        }
      ).map(({ student: { Section: studentClass, FirstName: studentName, OrgDefinedId: studentId }, total }) => [
        studentClass,
        studentName,
        studentId.substring(3),
        total || "AB",
        calculateGrade(total || 0)
      ])
    );
    return csv;
  }
  function generateSasCsv(criteria, studentResult, title, dateTimeGenerated = getDateTimeGenerated()) {
    const csv = generateSasCsvData(studentResult, title);
    downloadCsv(csv, {
      outputFilename: `brightspace_rubric_${title}_sas_${dateTimeGenerated}.csv`
    });
  }

  // src/scraper-dom.js
  function createContainer(title, orgId, onScrape, resultButtonsDefinitions) {
    const template = document.querySelector(".scraper-template");
    const containerNode = template.cloneNode(true);
    containerNode.removeAttribute("hidden");
    const titleH3 = containerNode.querySelector("h3");
    titleH3.textContent = title;
    const totalStudent = containerNode.querySelector(".total");
    const processedStudent = containerNode.querySelector(".processed");
    let processed = 0;
    const progress = containerNode.querySelector(".progress");
    const dataTable = containerNode.querySelector(".table");
    const gradesDistributionChart = containerNode.querySelector(".grades-distribution");
    const originalTotalStudentInnerHtml = totalStudent.innerHTML;
    const originalProgressInnerHtml = progress.innerHTML;
    const originalProcessed = processed;
    const originalProcessedStudentInnerHtml = processedStudent.innerHTML;
    const originalDataTableInnerHtml = dataTable.innerHTML;
    const originalGradesDistributionChartInnerHtml = gradesDistributionChart.innerHTML;
    const resetButton = containerNode.querySelector(".reset");
    const scrapeButton = containerNode.querySelector(".scrape");
    scrapeButton.textContent = `Scrape ${title} Rubric Excel`;
    const controlsContainer = containerNode.querySelector(".results > .controls");
    const resultButtons = resultButtonsDefinitions.map(([title2, onClick]) => {
      const button = document.createElement("button");
      button.textContent = title2;
      button.disabled = true;
      button.onclick = onClick;
      return button;
    });
    resultButtons.forEach((button) => {
      controlsContainer.appendChild(button);
    });
    function setTotalStudent(t) {
      totalStudent.textContent = t;
    }
    function addProgressText(t) {
      const progressText = document.createElement("li");
      progressText.textContent = t;
      progress.appendChild(progressText);
    }
    function incrementProcessedStudent(t) {
      processed += 1;
      processedStudent.textContent = processed;
    }
    function setResultButtonsIsDisabled(isDisabled = true) {
      resultButtons.forEach((button) => button.disabled = isDisabled);
    }
    function setResultButtonsOnClick(input) {
      resultButtons.forEach((button) => {
        const oldOnClick = button.onclick;
        button.onclick = () => oldOnClick(input);
      });
    }
    function generateDataTable(data) {
      const classNameColumnIndex = data.headings.indexOf(defaults_default.SAS_CSV_CLASS_COLUMN_NAME);
      const gradesColumnIndex = data.headings.indexOf(defaults_default.SAS_CSV_GRADES_COLUMN_NAME);
      new simpleDatatables.DataTable(dataTable, {
        data,
        perPage: 25,
        columns: [
          {
            select: classNameColumnIndex,
            filter: [...new Set(data.data.map((row) => row[classNameColumnIndex]))]
          },
          {
            select: gradesColumnIndex,
            sortable: false
          }
        ]
      });
    }
    function generateGradesDistributionChart(data) {
      const classNameColumnIndex = data.headings.indexOf(defaults_default.SAS_CSV_CLASS_COLUMN_NAME);
      const gradesColumnIndex = data.headings.indexOf(defaults_default.SAS_CSV_GRADES_COLUMN_NAME);
      const gradesCount = {};
      data.data.forEach((row) => {
        const className = row[classNameColumnIndex];
        const grade = row[gradesColumnIndex];
        if (!gradesCount[className])
          gradesCount[className] = {};
        gradesCount[className][grade] = (gradesCount[className][grade] || 0) + 1;
      });
      const datasets = Object.keys(gradesCount).sort().map((className) => ({
        label: className,
        data: gradesCount[className]
      }));
      new Chart(gradesDistributionChart, {
        type: "bar",
        data: { labels: defaults_default.GRADES, datasets },
        options: { scales: { x: { stacked: true }, y: { stacked: true } } }
      });
    }
    resetButton.onclick = () => {
      totalStudent.innerHTML = originalTotalStudentInnerHtml;
      progress.innerHTML = originalProgressInnerHtml;
      processed = originalProcessed;
      processedStudent.innerHTML = originalProcessedStudentInnerHtml;
      dataTable.innerHTML = originalDataTableInnerHtml;
      gradesDistributionChart.innerHTML = originalGradesDistributionChartInnerHtml;
      setResultButtonsIsDisabled();
      scrapeButton.hidden = false;
      resetButton.hidden = true;
    };
    scrapeButton.onclick = async () => {
      const container = {
        containerNode,
        addProgressText,
        setTotalStudent,
        incrementProcessedStudent
      };
      const { criteria, studentResult } = await onScrape(container);
      setResultButtonsIsDisabled(false);
      setResultButtonsOnClick({ container, criteria, studentResult });
      const csvData = generateSasCsvData(studentResult, title);
      const data = {
        headings: csvData.shift(),
        data: csvData
      };
      generateDataTable(data);
      generateGradesDistributionChart(data);
      scrapeButton.hidden = true;
      resetButton.hidden = false;
    };
    return containerNode;
  }
  function DomManipulator(scrape, orgId) {
    function addScraper(orgId2, title, rubricId, evalObjectId) {
      const containerNode = createContainer(
        title,
        orgId2,
        (container) => scrape({
          title,
          orgId: orgId2,
          rubricId,
          evalObjectId,
          container
        }),
        [
          [
            "Download Checker/Verifier Version",
            ({ container, criteria, studentResult }) => {
              container.addProgressText("Generating CSV for checking/verifying...");
              generateCheckingVerifyingCsv(criteria, studentResult, title);
            }
          ],
          [
            "Download SAS Version",
            ({ container, criteria, studentResult }) => {
              container.addProgressText("Generating CSV for SAS...");
              generateSasCsv(criteria, studentResult, title);
            }
          ]
        ]
      );
      document.body.appendChild(containerNode);
    }
    return {
      addScraper
    };
  }

  // src/scrape.js
  function Scraper(brightspaceApi) {
    async function getStudentList(orgId, jwt) {
      const [classList, sectionList] = await Promise.all([
        brightspaceApi.getClassList(orgId),
        brightspaceApi.getSectionList(orgId, jwt)
      ]);
      const studentsMap = {};
      const students = classList.filter(
        ({ RoleId: roleId }) => roleId === defaults_default.ROLES.STUDENT || roleId === defaults_default.ROLES.LEARNER
      );
      students.forEach((student) => {
        const { Identifier: id } = student;
        studentsMap[id] = student;
      });
      sectionList.forEach((section) => {
        const { Name: sectionName, Enrollments: enrollments } = section;
        enrollments.forEach((studentId) => {
          if (studentsMap[studentId])
            studentsMap[studentId].Section = sectionName;
        });
      });
      return students;
    }
    async function getRubricCriteria(organizationId, rubricId, jwt) {
      console.log("Getting Rubric Criteria");
      const criteriaGroups = await brightspaceApi.getRubricCriteria(organizationId, rubricId, jwt);
      const allCriteria = criteriaGroups.map(
        (criteriaGroup) => criteriaGroup.entities.map((criteria) => {
          const name = criteria.properties.name;
          const max = criteria.properties.outOf;
          const criteriaLink = criteria.links[0].href.split("/");
          const criteriaId = criteriaLink[criteriaLink.length - 1];
          return { name, max, criteriaId };
        })
      ).flat(2);
      return allCriteria;
    }
    function scrapeStudentRubricScore(orgId, evalObjectId, rubricId, studentId, jwt) {
      return brightspaceApi.getStudentRubricScore(orgId, evalObjectId, rubricId, studentId, jwt).then(
        (criteriaResults) => criteriaResults.map((criteriaResult) => {
          const criteriaLink = criteriaResult.links[0].href.split("/");
          const criteriaId = criteriaLink[criteriaLink.length - 1];
          return {
            id: +criteriaId,
            score: +criteriaResult.properties.score
          };
        })
      ).then((scores) => {
        const total = scores.reduce((total2, { score }) => total2 + score, 0);
        scores.push({ id: "total", score: total });
        return scores;
      });
    }
    async function scrapeStudent(students, jwt, config) {
      console.log("Scraping each student...");
      const scrapeStudentRubricPromises = students.map(
        ({ Identifier: userId }) => scrapeStudentRubricScore(config.orgId, config.evalObjectId, config.rubricId, userId, jwt).finally(
          config.container.incrementProcessedStudent
        )
      );
      const promises = await Promise.allSettled(scrapeStudentRubricPromises);
      console.log("Formatting result...");
      const result = promises.map((promise, id) => {
        const student = students[id];
        const row = { student };
        if (promise.status === "rejected") {
          return row;
        }
        const rubricScore = promise.value;
        rubricScore.forEach(({ id: id2, score }) => {
          row[id2] = score;
        });
        return row;
      });
      return result;
    }
    return async function scrape(config) {
      const { orgId, rubricId, container } = config;
      try {
        container.addProgressText("Getting Access Token...");
        const jwt = await brightspaceApi.getAccessToken(orgId);
        container.addProgressText("Getting Student List...");
        const students = await getStudentList(orgId, jwt);
        container.setTotalStudent(students.length);
        container.addProgressText(`Found ${students.length} students...`);
        container.addProgressText(`Scraping rubric...`);
        const getCriteriaPromise = getRubricCriteria(orgId, rubricId, jwt);
        const scrapePromise = scrapeStudent(students, jwt, config);
        const [criteria, studentResult] = await Promise.all([getCriteriaPromise, scrapePromise]);
        return { criteria, studentResult };
      } catch (error) {
        container.addProgressText(error.message);
      }
    };
  }

  // src/add-scraper-dom.js
  function initializeAssessmentSelect(brightspaceApi, organizationId, onAddScraper) {
    const assessmentSelect = document.getElementById("assessment-select");
    const rubricSelect = document.getElementById("rubric-select");
    const addScraperForm = document.getElementById("scrape-form");
    const assessmentRubricsMap = {};
    assessmentSelect.onchange = function() {
      rubricSelect.innerHTML = "";
      const selectedAssessment = assessmentSelect.value;
      assessmentRubricsMap[selectedAssessment].forEach((rubric) => {
        const { RubricId: id, Name: name } = rubric;
        const optionEle = document.createElement("option");
        optionEle.value = id;
        optionEle.textContent = name;
        rubricSelect.appendChild(optionEle);
      });
    };
    brightspaceApi.getAssessmentList(organizationId).then((assessments) => {
      assessments.forEach((assessment) => {
        const {
          Id: id,
          Name: name,
          Assessment: { Rubrics: rubrics }
        } = assessment;
        const optionEle = document.createElement("option");
        optionEle.value = id;
        optionEle.textContent = name;
        assessmentRubricsMap[id] = rubrics;
        assessmentSelect.appendChild(optionEle);
      });
    }).finally(() => {
      document.getElementById("loading").hidden = true;
      document.getElementById("scrape-form").hidden = false;
    });
    addScraperForm.onsubmit = function(event) {
      event.preventDefault();
      const title = assessmentSelect.options[assessmentSelect.selectedIndex].text;
      const evalObjectId = assessmentSelect.value;
      const rubricId = rubricSelect.value;
      onAddScraper({ title, rubricId, evalObjectId });
    };
  }

  // src/index.js
  function BrightspaceRubricScraper(brightspaceBase, brightspaceApiBase) {
    const brightspaceApi = BrightspaceApi(brightspaceBase, brightspaceApiBase);
    const scrape = Scraper(brightspaceApi);
    const organizationId = new URL(window.location).searchParams.get("ou");
    const domManipulator = DomManipulator(scrape, organizationId);
    const rubrics = JSON.parse(localStorage.getItem(`rubrics-${organizationId}`) || JSON.stringify([]));
    rubrics.forEach(
      ({ title, rubricId, evalObjectId }) => domManipulator.addScraper(organizationId, title, rubricId, evalObjectId)
    );
    function registerScraper(title, rubricId, evalObjectId) {
      rubrics.push({ title, rubricId, evalObjectId });
      localStorage.setItem(`rubrics-${organizationId}`, JSON.stringify(rubrics));
      domManipulator.addScraper(organizationId, title, rubricId, evalObjectId);
    }
    initializeAssessmentSelect(brightspaceApi, organizationId, ({ title, rubricId, evalObjectId }) => {
      registerScraper(title, rubricId, evalObjectId);
    });
  }
  return __toCommonJS(src_exports);
})();
