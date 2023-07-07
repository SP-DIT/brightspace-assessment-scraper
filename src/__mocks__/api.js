import { faker } from '@faker-js/faker';
import DEFAULTS from '../lib/defaults';

const fakeClassList = Array(50)
    .fill(null)
    .map(() => ({
        Identifier: faker.string.numeric(6),
        RoleId: DEFAULTS.ROLES.STUDENT,
        OrgDefinedId: `SP_P${faker.string.numeric(7)}`,
        Username: faker.internet.email(),
        FirstName: faker.person.fullName(),
    }));

const fakeSections = Array(5)
    .fill(null)
    .map((_, index) => ({
        SectionId: faker.string.numeric(6),
        Name: `Class ${index + 1}`,
        Enrollments: fakeClassList.slice(index * 10, index * 10 + 10).map(({ Identifier }) => Identifier),
    }));

const fakeCriteria = Array(10)
    .fill(null)
    .map(() => ({ name: faker.commerce.productName(), max: 10, criteriaId: faker.string.numeric({ min: 5, max: 6 }) }));

const fakeAssessmentList = Array(3)
    .fill(null)
    .map(() => ({
        Id: +faker.string.numeric(6),
        Name: faker.commerce.productName(),
        Assessment: {
            Rubrics: [
                {
                    RubricId: +faker.string.numeric(5),
                    Name: faker.commerce.productName(),
                },
            ],
        },
    }));

const fakeSemesterList = Array(5)
    .fill(null)
    .map(() => faker.string.numeric(4));
const fakeModuleList = Array(50)
    .fill(null)
    .map(() => ({
        OrgUnit: {
            Id: +faker.string.numeric(6),
            Name: faker.commerce.productName(),
            Code: `${faker.commerce.productAdjective()}-${fakeSemesterList[faker.number.int(4)]}`,
        },
    }));

export default function BrightspaceApi(brightspaceBase, brightspaceApiBase) {
    async function getClassList(organizationId) {
        return fakeClassList;
    }

    async function getSectionList(organizationId, jwt) {
        return fakeSections;
    }

    async function getAccessToken(orgId) {
        return faker.string.alphanumeric(50);
    }

    async function getRubricCriteria(organizationId, rubricId, jwt) {
        return fakeCriteria;
    }

    async function getStudentRubricScore(orgId, evalObjectId, rubricId, studentId, jwt) {
        await new Promise((resolve) => setTimeout(resolve, faker.number.int({ min: 100, max: 100 })));
        return fakeCriteria.map(({ criteriaId }) => ({
            id: +criteriaId,
            score: faker.number.int(10),
        }));
    }

    async function getAssessmentList(organizationId) {
        return fakeAssessmentList;
    }

    async function getModuleEnrollmentList() {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(fakeModuleList), 0);
        });
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
