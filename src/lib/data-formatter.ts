import DEFAULTS from './defaults';



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

function downloadCsv(rows, options = { outputFilename: '', delimiter: ',' }) {
    let csvContent = 'data:text/csv;charset=utf-8,';

    rows.forEach(function (rowArray) {
        let row = rowArray.join(options.delimiter);
        csvContent += row + '\r\n';
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);

    let outputFilename = options.outputFilename;
    if (!outputFilename) {
        outputFilename = `brightspace_rubric_${Math.floor(+new Date() / 1000)}.csv`;
    }
    link.setAttribute('download', outputFilename);
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
}

export function generateCheckingVerifyingCsv(
    criteria,
    studentResult,
    title,
    dateTimeGenerated = getDateTimeGenerated()
) {
    console.log(criteria, studentResult);
    const csv = [['AYXX/XX', '', 'Semester X', '', title, '', 'Weightage:', '???'], [], [], [], []];

    const criteriaMax = [
        dateTimeGenerated,
        '',
        '',
        'Max',
        ...criteria.map(({ max }) => max), // max of each criteria
        criteria.reduce((total, { max }) => total + max, 0), // max total
    ];

    const criteriaNames = [
        'Student Id',
        'Name',
        'IChat',
        'Class',
        ...criteria.map(({ name }) => name),
        'Total',
        'Grade',
    ];

    const sections = new Set();
    const sectionsMap = {};

    studentResult.forEach((result) => {
        const { student } = result;
        const studentId = student['OrgDefinedId'].substring(3);
        const studentName = student['FirstName'];
        const ichatEmail = student['Username'];
        const studentClass = student['Section'];
        const row = [studentId, studentName, ichatEmail, studentClass];
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
        csv.push(['Marked by:', '', 'date:', '', 'Sign:']);
        csv.push(['Checked by:', '', 'date:', '', 'Sign:']);
    });

    downloadCsv(csv, {
        outputFilename: `brightspace_rubric_${title}_marksheet_${dateTimeGenerated}.csv`,
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
    });
}
