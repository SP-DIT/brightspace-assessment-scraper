import { generateCheckingVerifyingCsv, generateSasCsv, generateSasCsvData } from './data-formatter';
import DEFAULTS from './defaults';

function createContainer(title, orgId, onScrape, resultButtonsDefinitions) {
    // Clone template and make visible
    const template = document.querySelector('.scraper-template');
    const containerNode = template.cloneNode(true);
    containerNode.removeAttribute('hidden');

    // Title
    const titleH3 = containerNode.querySelector('h3');
    titleH3.textContent = title;

    // Modifiable content
    const totalStudent = containerNode.querySelector('.total');
    const processedStudent = containerNode.querySelector('.processed');
    let processed = 0;
    const progress = containerNode.querySelector('.progress');
    const dataTable = containerNode.querySelector('.table');
    const gradesDistributionChart = containerNode.querySelector('.grades-distribution');

    // original value
    const originalTotalStudentInnerHtml = totalStudent.innerHTML;
    const originalProgressInnerHtml = progress.innerHTML;
    const originalProcessed = processed;
    const originalProcessedStudentInnerHtml = processedStudent.innerHTML;
    const originalDataTableInnerHtml = dataTable.innerHTML;
    const originalGradesDistributionChartInnerHtml = gradesDistributionChart.innerHTML;

    // Buttons
    const resetButton = containerNode.querySelector('.reset');
    const scrapeButton = containerNode.querySelector('.scrape');
    scrapeButton.textContent = `Scrape ${title} Rubric Excel`;

    // Result buttons: To download the results
    const controlsContainer = containerNode.querySelector('.results > .controls');
    const resultButtons = resultButtonsDefinitions.map(([title, onClick]) => {
        const button = document.createElement('button');
        button.textContent = title;
        button.onclick = onClick;
        return button;
    });
    resultButtons.forEach((button) => {
        controlsContainer.appendChild(button);
    });

    // Functions to manipulate container
    function setTotalStudent(t) {
        totalStudent.textContent = t;
    }
    function addProgressText(t) {
        const progressText = document.createElement('li');
        progressText.textContent = t;
        progress.appendChild(progressText);
    }
    function incrementProcessedStudent(t) {
        processed += 1;
        processedStudent.textContent = processed;
    }
    function setResultButtonsIsDisabled(isDisabled = true) {
        resultButtons.forEach((button) => (button.disabled = isDisabled));
    }
    function setResultButtonsOnClick(input) {
        resultButtons.forEach((button) => (button.onclick = () => button.onclick(input)));
    }
    function generateDataTable(data) {
        const classNameColumnIndex = data.headings.indexOf(DEFAULTS.SAS_CSV_CLASS_COLUMN_NAME);
        const gradesColumnIndex = data.headings.indexOf(DEFAULTS.SAS_CSV_GRADES_COLUMN_NAME);

        new simpleDatatables.DataTable(dataTable, {
            data,
            perPage: 25,
            columns: [
                {
                    select: classNameColumnIndex,
                    filter: [...new Set(data.data.map((row) => row[classNameColumnIndex]))],
                },
                {
                    select: gradesColumnIndex,
                    sortable: false,
                },
            ],
        });
    }

    function generateGradesDistributionChart(data) {
        const classNameColumnIndex = data.headings.indexOf(DEFAULTS.SAS_CSV_CLASS_COLUMN_NAME);
        const gradesColumnIndex = data.headings.indexOf(DEFAULTS.SAS_CSV_GRADES_COLUMN_NAME);

        const gradesCount = {};
        data.data.forEach((row) => {
            const className = row[classNameColumnIndex];
            const grade = row[gradesColumnIndex];
            if (!gradesCount[className]) gradesCount[className] = {};
            gradesCount[className][grade] = (gradesCount[className][grade] || 0) + 1;
        });

        const datasets = Object.keys(gradesCount)
            .sort()
            .map((className) => ({
                label: className,
                data: gradesCount[className],
            }));
        new Chart(gradesDistributionChart, {
            type: 'bar',
            data: { labels: DEFAULTS.GRADES, datasets },
            options: { scales: { x: { stacked: true }, y: { stacked: true } } },
        });
    }

    // Reset modifiable content to original value
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
            incrementProcessedStudent,
        };
        const { criteria, studentResult } = await onScrape(container);
        setResultButtonsIsDisabled(false);
        setResultButtonsOnClick({ container, criteria, studentResult });

        const csvData = generateSasCsvData(studentResult, title);
        const data = {
            headings: csvData.shift(),
            data: csvData,
        };
        generateDataTable(data);
        generateGradesDistributionChart(data);

        scrapeButton.hidden = true;
        resetButton.hidden = false;
    };

    return containerNode;
}

export default function DomManipulator(scrape, orgId) {
    function addScraper(orgId, title, rubricId, evalObjectId) {
        const containerNode = createContainer(
            title,
            orgId,
            (container) =>
                scrape({
                    title,
                    orgId,
                    rubricId,
                    evalObjectId,
                    container,
                }),
            {
                'download-checker-verifier': [
                    'Download Checker/Verifier Version',
                    ({ container, criteria, studentResult }) => {
                        container.addProgressText('Generating CSV for checking/verifying...');
                        generateCheckingVerifyingCsv(criteria, studentResult, title);
                    },
                ],
                'download-SAS': [
                    'Download SAS Version',
                    ({ container, criteria, studentResult }) => {
                        container.addProgressText('Generating CSV for SAS...');
                        generateSasCsv(criteria, studentResult, title);
                    },
                ],
            },
        );
        document.body.appendChild(containerNode);
    }

    return {
        initializeAssessmentSelect,
        addScraper,
    };
}
