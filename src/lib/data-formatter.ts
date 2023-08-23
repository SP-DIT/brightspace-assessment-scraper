import DEFAULTS from './defaults';
import * as xlsx from 'xlsx';
import FileSaver from 'file-saver';

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

function downloadXlsx(aoa, options = { outputFilename: '' }) {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(aoa);
    xlsx.utils.book_append_sheet(workbook, worksheet);
    const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    let outputFilename = options.outputFilename;
    if (!outputFilename) {
        outputFilename = `brightspace_rubric_${Math.floor(+new Date() / 1000)}.xlsx`;
    }

    return downloadFile(excelBlob, outputFilename);
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
    studentResult,
    title,
    dateTimeGenerated = getDateTimeGenerated(),
    options = {
        acadYear: 'AYXX/XX',
        semester: 'X',
        weightage: '???',
    }
) {
    console.log(criteria, studentResult);
    const csv = [[options.acadYear, `Semester ${options.semester}`, title, 'Weightage:', options.weightage], []];

    const criteriaMax = [
        dateTimeGenerated,
        '',
        'Max',
        ...criteria.map(({ max }) => max), // max of each criteria
        criteria.reduce((total, { max }) => total + max, 0), // max total
    ];

    const criteriaNames = ['Student Id', 'Name', 'Class', ...criteria.map(({ name }) => name), 'Total', 'Grade'];

    const sections: Set<string> = new Set();
    const sectionsMap = {};

    studentResult.forEach((result) => {
        const { student } = result;
        const studentId = student['OrgDefinedId'].substring(3);
        const studentName = student['FirstName'];
        const studentClass = student['Section'];
        const row = [studentId, studentName, studentClass];
        criteria.forEach((criterion) => {
            const { criteriaId } = criterion;
            const score = result.total ? result[criteriaId] || 0 : 'AB';
            row.push(score);
        });
        row.push(result.total || 'AB');
        row.push(calculateGrade(result.total || 0));

        sections.add(studentClass);
        if (!sectionsMap[studentClass]) sectionsMap[studentClass] = [];
        sectionsMap[studentClass].push(row);
    });

    const sectionsArray: string[] = [...sections];
    sectionsArray.sort().forEach((section) => {
        csv.push([]);
        csv.push([]);
        csv.push([]);
        csv.push([]);
        const sectionRows = sectionsMap[section].sort();
        csv.push(criteriaMax);
        csv.push(criteriaNames);
        sectionRows.forEach((row) => csv.push(row));
        csv.push(['Marked by:', '', 'date:', '', 'Sign:']);
        csv.push(['Checked by:', '', 'date:', '', 'Sign:']);
    });

    downloadXlsx(csv, {
        outputFilename: `brightspace_rubric_${title}_marksheet_${dateTimeGenerated}.xlsx`,
    });
}

export function generateSasCsvData(studentResult, title) {
    const csv = [
        [DEFAULTS.SAS_CSV_CLASS_COLUMN_NAME, 'Name', 'Student Id', title, DEFAULTS.SAS_CSV_GRADES_COLUMN_NAME],
    ];
    csv.push(
        ...studentResult
            .sort(
                ({ student: { Section: s1, OrgDefinedId: id1 } }, { student: { Section: s2, OrgDefinedId: id2 } }) => {
                    // sort by class then sort by student id
                    const classSort = s1.localeCompare(s2);
                    if (classSort === 0) {
                        return id1.localeCompare(id2);
                    }
                    return classSort;
                }
            )
            .map(({ student: { Section: studentClass, FirstName: studentName, OrgDefinedId: studentId }, total }) => [
                studentClass,
                studentName,
                studentId.substring(3),
                total || 'AB',
                calculateGrade(total || 0),
            ])
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
