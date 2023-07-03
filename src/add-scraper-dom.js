function showLoading(isShow = true) {
    document.getElementById('loading').hidden = !isShow;
    document.getElementById('scrape-form-container').hidden = isShow;
}
function hideLoading() {
    showLoading(false);
}

const pages = {
    MODULE_SELECT: 'MODULE_SELECT',
    ASSESSMENT_SELECT: 'ASSESSMENT_SELECT',
};

function switchTo(page) {
    document.getElementById('module-select-datatable-container').hidden = page !== pages.MODULE_SELECT;
    document.getElementById('scrape-form').hidden = page !== pages.ASSESSMENT_SELECT;
}

export async function initializeModuleSelect(brightspaceApi, onAddScraper) {
    showLoading();
    const moduleEnrollmentList = await brightspaceApi.getModuleEnrollmentList().finally(hideLoading);

    // Format rows
    function makeButton(id, name) {
        const button = document.createElement('button');
        button.textContent = 'Add';
        button.className = 'add-button';
        button.setAttribute('data-id', id);
        button.setAttribute('data-name', name);
        return button.outerHTML;
    }
    const rows = moduleEnrollmentList.map(({ OrgUnit: { Id, Name, Code } }) => [
        Code.split('-').slice(-1)[0],
        Name,
        makeButton(Id),
    ]);

    // Create table
    const table = new simpleDatatables.DataTable('#module-select-datatable', {
        data: {
            headings: ['Semester', 'Name', 'Add'],
            data: rows,
        },
        columns: [{ select: 0, filter: [...new Set(rows.map(([semester]) => semester))] }],
    });

    // Register button onclicks
    function registerAddButton(table) {
        table.dom.querySelectorAll('button.add-button').forEach((button) => {
            button.onclick = function () {
                const organizationId = button.getAttribute('data-id');
                switchTo(pages.ASSESSMENT_SELECT);
                initializeAssessmentSelect(brightspaceApi, organizationId, onAddScraper, () =>
                    switchTo(pages.MODULE_SELECT),
                );
            };
        });
    }
    table.on('datatable.init', function () {
        registerAddButton(table);
    });
    table.on('datatable.page', function () {
        registerAddButton(table);
    });
}

function initializeAssessmentSelect(brightspaceApi, organizationId, onAddScraper, onBack) {
    // Initialize selects
    const assessmentSelect = document.getElementById('assessment-select');
    const rubricSelect = document.getElementById('rubric-select');
    const addScraperForm = document.getElementById('scrape-form');
    const backButton = document.getElementById('back-assessment-select');

    const assessmentRubricsMap = {};
    assessmentSelect.onchange = function () {
        rubricSelect.innerHTML = '';
        const selectedAssessment = assessmentSelect.value;
        assessmentRubricsMap[selectedAssessment].forEach((rubric) => {
            const { RubricId: id, Name: name } = rubric;
            const optionEle = document.createElement('option');
            optionEle.value = id;
            optionEle.textContent = name;
            rubricSelect.appendChild(optionEle);
        });
    };

    // Add new scraper (also save to localStorage)
    addScraperForm.onsubmit = function (event) {
        event.preventDefault();
        const title = assessmentSelect.options[assessmentSelect.selectedIndex].text;
        const evalObjectId = assessmentSelect.value;
        const rubricId = rubricSelect.value;

        onAddScraper({ title, rubricId, evalObjectId });
    };

    backButton.onClick = onBack;

    showLoading();
    return brightspaceApi
        .getAssessmentList(organizationId)
        .then((assessments) => {
            assessments.forEach((assessment) => {
                const {
                    Id: id,
                    Name: name,
                    Assessment: { Rubrics: rubrics },
                } = assessment;
                const optionEle = document.createElement('option');
                optionEle.value = id;
                optionEle.textContent = name;
                assessmentRubricsMap[id] = rubrics;
                assessmentSelect.appendChild(optionEle);
            });
        })
        .finally(hideLoading);
}
