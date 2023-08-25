import DEFAULTS from './defaults';
import JSZip from 'jszip';
import * as xlsx from 'xlsx';
import FileSaver from 'file-saver';
import { StudentScore } from './brightspace-assessment-scraper';

function getDateTimeGenerated() {
    return new Date().toLocaleString().replace(', ', 'T');
}

export function calculateGrade(score) {
    const start = 80;
    const step = 5;
    const grades = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'D-'];
    const cutOffPoint = grades.map((_, idx) => start - idx * step);

    for (let i = 0; i < cutOffPoint.length; i += 1) {
        if (score >= cutOffPoint[i]) {
            return grades[i];
        }
    }

    return 'F';
}

function downloadXlsxZips(aoas, zipOutputFilename) {
    const zip = new JSZip();
    aoas.forEach(({ aoa, outputFilename }) => {
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.aoa_to_sheet(aoa);
        xlsx.utils.book_append_sheet(workbook, worksheet);
        const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        const excelBlob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        zip.file(outputFilename.replaceAll('/', ''), excelBlob);
    });

    return zip.generateAsync({ type: 'blob' }).then((content) => downloadFile(content, zipOutputFilename));
}

function downloadCsv(rows, options = { outputFilename: '', delimiter: ',' }) {
    let csvContent = 'data:text/csv;charset=utf-8,';

    rows.forEach(function (rowArray) {
        let row = rowArray.join(options.delimiter);
        csvContent += row + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    let outputFilename = options.outputFilename;
    if (!outputFilename) {
        outputFilename = `brightspace_rubric_${Math.floor(+new Date() / 1000)}.csv`;
    }

    return downloadFile(encodedUri, outputFilename);
}

function downloadFile(data, outputFilename) {
    FileSaver.saveAs(data, outputFilename);
}

export function generateCheckingVerifyingCsv(
    criteria,
    studentResult: StudentScore[],
    dateTimeGenerated = getDateTimeGenerated(),
    metadata = {
        institution: 'Singapore Polytechnic',
        school: 'School of Computing',
        moduleCode: 'STXXXX',
        moduleName: 'XXXX XXXX XXXX',
        acadYear: 'AYXX/XX',
        semester: 'X',
        assignmentName: 'XXXX',
        weightage: '???',
    }
) {
    const criteriaMax = [
        dateTimeGenerated,
        '',
        'Max',
        ...criteria.map(({ max }) => max), // max of each criteria
        criteria.reduce((total, { max }) => total + max, 0), // max total
    ];

    const metadataRows = [
        ...Object.entries(metadata).map(([key, value]) => [key.replace(/([A-Z])/g, ' $1').toUpperCase(), value]),
    ];

    const criteriaNames = [
        'Student Id',
        'Name',
        'Class',
        ...criteria.map(({ name }) => name),
        `${metadata.assignmentName}\n(for SAS ${metadata.weightage})`,
        'Grade',
    ];

    const sections: Set<string> = new Set();
    const sectionsMap = {};

    studentResult.forEach((result) => {
        const { student, scores } = result;
        const studentId = student['OrgDefinedId'].substring(3);
        const studentName = student['FirstName'];
        const studentClass = student['Section'] || 'No Class';
        const row: any[] = [studentId, studentName, studentClass];
        criteria.forEach((criterion) => {
            const { criteriaId } = criterion;
            const score = scores.total ? scores[criteriaId] || 0 : 'AB';
            row.push(score);
        });
        row.push(scores.total || 'AB');
        row.push(calculateGrade(scores.total || 0));

        sections.add(studentClass);
        if (!sectionsMap[studentClass]) sectionsMap[studentClass] = [];
        sectionsMap[studentClass].push(row);
    });

    const sectionsArray: string[] = [...sections];
    const aoaBySection: any[] = [];
    sectionsArray.sort().forEach((section) => {
        const sectionRows = sectionsMap[section].sort();

        const aoa: any[] = [...metadataRows, ['CLASS', section], []];
        aoa.push([]);
        aoa.push(criteriaMax);
        aoa.push(criteriaNames);

        sectionRows.forEach((row) => aoa.push(row));

        const outputFilename = `${metadata.acadYear}S${metadata.semester}-${metadata.moduleCode}-${section.replaceAll(
            '/',
            ''
        )}-${metadata.assignmentName}.xlsx`;

        aoaBySection.push({ aoa, outputFilename });
    });

    downloadXlsxZips(aoaBySection, `brightspace_assignment-${dateTimeGenerated}.zip`);
}

export function generateSasCsvData(studentResult: StudentScore[], title) {
    const csv = [
        [DEFAULTS.SAS_CSV_CLASS_COLUMN_NAME, 'Name', 'Student Id', title, DEFAULTS.SAS_CSV_GRADES_COLUMN_NAME],
    ];
    csv.push(
        ...studentResult
            .sort(
                ({ student: { Section: s1, OrgDefinedId: id1 } }, { student: { Section: s2, OrgDefinedId: id2 } }) => {
                    // sort by class then sort by student id
                    if (!s1 && !s2) return 0;
                    else if (!s1) return 1;
                    else if (!s2) return -1;

                    const classSort = s1.localeCompare(s2);
                    if (classSort === 0) {
                        return id1.localeCompare(id2);
                    }
                    return classSort;
                }
            )
            .map(
                ({
                    student: { Section: studentClass, FirstName: studentName, OrgDefinedId: studentId },
                    scores: { total },
                }) => [studentClass, studentName, studentId.substring(3), total || 'AB', calculateGrade(total || 0)]
            )
    );
    return csv;
}

export function generateSasCsv(criteria, studentResult, title, dateTimeGenerated = getDateTimeGenerated()) {
    const csv = generateSasCsvData(studentResult, title);
    downloadCsv(csv, {
        outputFilename: `brightspace_rubric_${title}_sas_${dateTimeGenerated}.csv`,
        delimiter: ',',
    });
}
