export default function SingleScraper({ scraper: { orgUnit, assignment, rubric } }) {
    return (
        <div>
            <p>{orgUnit.id}</p>
            <p>{assignment.id}</p>
            <p>{rubric.id}</p>
        </div>
    );
}
