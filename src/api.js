export default function BrightspaceApi(brightspaceBase, brightspaceApiBase) {
    const brightspaceApi = {
        assessmentList: (organizationId) =>
            new URL(`/d2l/api/le/1.8/${organizationId}/dropbox/folders/`, brightspaceApiBase).toString(),

        classList: (organizationId) =>
            new URL(`/d2l/api/le/1.8/${organizationId}/classlist/`, brightspaceBase).toString(),

        sectionList: (organizationId) =>
            new URL(`/d2l/api/lp/1.8/${organizationId}/sections/`, brightspaceApiBase).toString(),

        authToken: () => new URL(`/d2l/lp/auth/oauth2/token`, brightspaceBase).toString(),

        referrer: (organizationId) =>
            new URL('/d2l/ap/insights/classEngagement/View?ou=' + organizationId, brightspaceBase).toString(),

        rubricsCriteria: (organizationId, rubricId) =>
            new URL(`/organizations/${organizationId}/${rubricId}/groups`, brightspaceApiBase).toString(),

        rubricsScore: () => new URL('/d2l/lms/competencies/rubric/rubrics_assessment_results.d2l', brightspaceBase),

        gradesExport: (organizationId) =>
            new URL(
                `/d2l/lms/grades/admin/importexport/export/options_edit.d2l?ou=${organizationId}`,
                brightspaceBase,
            ).toString(),

        enrollmentList: () =>
            new URL(
                `/d2l/api/lp/1.8/enrollments/myenrollments/?orgUnitTypeId=3&sortBy=-StartDate`,
                brightspaceBase,
            ).toString(),
    };

    async function getClassList(organizationId) {
        const response = await fetch(brightspaceApi.classList(organizationId));
        return response.json();
    }

    async function getSectionList(organizationId, jwt) {
        const response = await fetch(brightspaceApi.sectionList(organizationId), {
            headers: { authorization: `Bearer ${jwt}` },
        });
        return response.json();
    }

    async function getAccessToken() {
        const xsrfToken = localStorage.getItem('XSRF.Token');
        const response = await fetch(brightspaceApi.authToken(), {
            headers: {
                accept: '*/*',
                'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8',
                'content-type': 'application/x-www-form-urlencoded',
                'sec-ch-ua': '" Not;A Brand";v="99", "Microsoft Edge";v="103", "Chromium";v="103"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-csrf-token': xsrfToken,
            },
            referrer: brightspaceApi.referrer(),
            referrerPolicy: 'strict-origin-when-cross-origin',
            body: 'scope=*%3A*%3A*',
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
        });
        const data = await response.json();
        return data.access_token;
    }

    async function getRubricCriteria(organizationId, rubricId, jwt) {
        const response = await fetch(brightspaceApi.rubricsCriteria(organizationId, rubricId), {
            headers: { authorization: `Bearer ${jwt}` },
        });
        const data = await response.json();
        const links = data.entities.map((entity) => entity.links[0].href);

        const criteriaGroups = await Promise.all(
            links.map((url) =>
                fetch(url, { headers: { authorization: `Bearer ${jwt}` } }).then((response) => response.json()),
            ),
        );

        return criteriaGroups
            .map((criteriaGroup) =>
                criteriaGroup.entities.map((criteria) => {
                    const name = criteria.properties.name;
                    const max = criteria.properties.outOf;
                    const criteriaLink = criteria.links[0].href.split('/');
                    const criteriaId = criteriaLink[criteriaLink.length - 1];
                    return { name, max, criteriaId };
                }),
            )
            .flat(2);
    }

    async function getStudentRubricScore(orgId, evalObjectId, rubricId, studentId, jwt) {
        // Preparing URL to get HTML page of student rubrics page
        const url = brightspaceApi.rubricsScore();
        const params = {
            ou: orgId,
            evalObjectId: evalObjectId,
            userId: studentId,
            rubricId: rubricId,
            evalObjectType: '1',
            groupId: '0',
            d2l_body_type: '5',
            closeButton: '1',
            showRubricHeadings: '0',
        };
        Object.entries(params).forEach(([name, value]) => url.searchParams.append(name, value));

        // Get student rubrics page
        const response = await fetch(url);
        const studentRubricsHtml = await response.text();

        // Find link to get rubric x assessment data.
        const matches = studentRubricsHtml.match(/assessment-href="(.*?)"/);
        if (!matches) throw new Error('No matches');
        const studentRubricCriteriaUrl = matches[1];

        // Get rubric x assessment data, which contains links for each criteria
        const studentRubricCriteriaResponse = await fetch(studentRubricCriteriaUrl, {
            headers: { authorization: `Bearer ${jwt}` },
        });
        const studentRubricCriteriaData = await studentRubricCriteriaResponse.json();
        const studentRubricCriteriaAssessmentLinks = studentRubricCriteriaData.entities
            .filter((entity) => entity.class[0] === 'criterion-assessment-links') // TODO: Explain magic number
            .map((entity) => entity.links[2].href); // TODO: Explain magic number

        // Get the score for each criteria and its score for this rubric x assessment
        const criteriaResults = await Promise.all(
            studentRubricCriteriaAssessmentLinks.map(async (link) => {
                const response = await fetch(link, { headers: { authorization: `Bearer ${jwt}` } });
                return response.json();
            }),
        );

        return criteriaResults.map((criteriaResult) => {
            const criteriaLink = criteriaResult.links[0].href.split('/');
            const criteriaId = criteriaLink[criteriaLink.length - 1];
            return {
                id: +criteriaId,
                score: +criteriaResult.properties.score,
            };
        });
    }

    async function getAssessmentList(organizationId) {
        const jwt = await getAccessToken();
        const response = await fetch(brightspaceApi.assessmentList(organizationId), {
            headers: { authorization: `Bearer ${jwt}` },
        });
        return await response.json();
    }

    async function getModuleEnrollmentList() {
        let hasMoreItem = true;
        const data = [];
        const jwt = await getAccessToken();
        while (hasMoreItem) {
            const response = await fetch(brightspaceApi.enrollmentList(), {
                headers: { authorization: `Bearer ${jwt}` },
            });
            const json = await response.json();
            hasMoreItem = json.PagingInfo.HasMoreItems;
            data.push(...json.Items);
        }
        return data;
    }

    return {
        getAssessmentList,
        getClassList,
        getSectionList,
        getAccessToken,
        getRubricCriteria,
        getStudentRubricScore,
        getModuleEnrollmentList,
    };
}
