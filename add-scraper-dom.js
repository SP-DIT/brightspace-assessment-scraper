export function initializeAssessmentSelect(brightspaceApi, onAddScraper) {
    // Initialize selects
    const assessmentSelect = document.getElementById('assessment-select');
    const rubricSelect = document.getElementById('rubric-select');
    const addScraperForm = document.getElementById('scrape-form');

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

    brightspaceApi
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
        .finally(() => {
            // Hide loading and Show the form
            document.getElementById('loading').hidden = true;
            document.getElementById('scrape-form').hidden = false;
        });

    // Add new scraper (also save to localStorage)
    addScraperForm.onsubmit = function (event) {
        event.preventDefault();
        const title = assessmentSelect.options[assessmentSelect.selectedIndex].text;
        const evalObjectId = assessmentSelect.value;
        const rubricId = rubricSelect.value;

        onAddScraper({ title, rubricId, evalObjectId });
    };
}
