import DEFAULTS from './defaults';

export default function Scraper(brightspaceApi) {
    async function getStudentList(orgId, jwt) {
        const [classList, sectionList] = await Promise.all([
            brightspaceApi.getClassList(orgId),
            brightspaceApi.getSectionList(orgId, jwt),
        ]);
        const studentsMap = {};
        const students = classList.filter(
            ({ RoleId: roleId }) => roleId === DEFAULTS.ROLES.STUDENT || roleId === DEFAULTS.ROLES.LEARNER,
        );

        students.forEach((student) => {
            const { Identifier: id } = student;
            studentsMap[id] = student;
        });

        sectionList.forEach((section) => {
            const { Name: sectionName, Enrollments: enrollments } = section;
            enrollments.forEach((studentId) => {
                if (studentsMap[studentId]) studentsMap[studentId].Section = sectionName;
            });
        });

        return students;
    }

    function scrapeStudentRubricScore(orgId, evalObjectId, rubricId, studentId, jwt) {
        return brightspaceApi.getStudentRubricScore(orgId, evalObjectId, rubricId, studentId, jwt).then((scores) => {
            const total = scores.reduce((total, { score }) => total + score, 0);
            scores.push({ id: 'total', score: total });
            return scores;
        });
    }

    async function scrapeStudent(students, jwt, config) {
        const scrapeStudentRubricPromises = students.map(({ Identifier: userId }) =>
            scrapeStudentRubricScore(config.orgId, config.evalObjectId, config.rubricId, userId, jwt).finally(
                config.container.incrementProcessedStudent,
            ),
        );
        const promises = await Promise.allSettled(scrapeStudentRubricPromises);

        const result = promises.map((promise, id) => {
            const student = students[id];
            const row = { student };
            if (promise.status === 'rejected') {
                return row;
            }
            const rubricScore = promise.value;
            rubricScore.forEach(({ id, score }) => {
                row[id] = score;
            });
            return row;
        });

        return result;
    }

    async function scrape(config) {
        const {
            orgId,
            rubricId,
            container: { next, setTotalStudent, onError },
        } = config;
        try {
            next();
            const jwt = await brightspaceApi.getAccessToken(orgId);

            next();
            const students = await getStudentList(orgId, jwt);
            setTotalStudent(students.length);

            next();
            const getCriteriaPromise = brightspaceApi.getRubricCriteria(orgId, rubricId, jwt);
            const scrapePromise = scrapeStudent(students, jwt, config);
            const [criteria, studentResult] = await Promise.all([getCriteriaPromise, scrapePromise]);

            next();
            return { criteria, studentResult };
        } catch (error) {
            onError(error);
        }
    }

    return {
        brightspaceApi,
        scrape,
    };
}
