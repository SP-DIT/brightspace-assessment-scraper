import BrightspaceApi from './api';
import DomManipulator from './scraper-dom';
import Scraper from './scrape';
import { initializeAssessmentSelect } from './add-scraper-dom';

export default function BrightspaceRubricScraper(brightspaceBase, brightspaceApiBase) {
    const brightspaceApi = BrightspaceApi(brightspaceBase, brightspaceApiBase);
    const scrape = Scraper(brightspaceApi);
    const organizationId = new URL(window.location).searchParams.get('ou');
    const domManipulator = DomManipulator(scrape, organizationId);

    // ad from localStorage
    const rubrics = JSON.parse(localStorage.getItem(`rubrics-${organizationId}`) || JSON.stringify([]));
    rubrics.forEach(({ title, rubricId, evalObjectId }) =>
        domManipulator.addScraper(organizationId, title, rubricId, evalObjectId),
    );

    function registerScraper(title, rubricId, evalObjectId) {
        rubrics.push({ title, rubricId, evalObjectId });
        localStorage.setItem(`rubrics-${organizationId}`, JSON.stringify(rubrics));
        domManipulator.addScraper(organizationId, title, rubricId, evalObjectId);
    }

    initializeAssessmentSelect(brightspaceApi, organizationId, ({ title, rubricId, evalObjectId }) => {
        registerScraper(title, rubricId, evalObjectId);
    });
}
