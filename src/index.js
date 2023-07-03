import RealBrightspaceApi from './api';
import MockBrightspaceApi from './__mocks__/api';

import DomManipulator from './scraper-dom';
import Scraper from './scrape';
import { initializeModuleSelect } from './add-scraper-dom';

const BrightspaceApi = process.env.NODE_ENV === 'test' ? MockBrightspaceApi : RealBrightspaceApi;

export default function BrightspaceRubricScraper(brightspaceBase, brightspaceApiBase) {
    const brightspaceApi = BrightspaceApi(brightspaceBase, brightspaceApiBase);
    const scrape = Scraper(brightspaceApi);
    const organizationId = new URL(window.location).searchParams.get('ou');
    const domManipulator = DomManipulator(scrape);
    const localStorageKey = `brightspace-rubrics-scraper`;

    // ad from localStorage
    let rubrics = [];
    if (process.env.NODE_ENV !== 'test') {
        rubrics = JSON.parse(localStorage.getItem(localStorageKey) || JSON.stringify([]));
        rubrics.forEach(({ title, rubricId, evalObjectId }) =>
            domManipulator.addScraper(organizationId, title, rubricId, evalObjectId),
        );
    }

    initializeModuleSelect(brightspaceApi, ({ orgId, title, rubricId, evalObjectId }) => {
        rubrics.push({ title, rubricId, evalObjectId, orgId });
        localStorage.setItem(localStorageKey, JSON.stringify(rubrics));
        domManipulator.addScraper(orgId, title, rubricId, evalObjectId);
    });
}
